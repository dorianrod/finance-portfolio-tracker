"""Parser for pre-formatted direct operation CSV files (livrets, private
equity, etc.).

Expected columns (exactly):
    date, account, isin, ticker, name, operation_type,
    quantity, price_per_unit, total_amount, currency

The file is already in the canonical format — no mapping needed.
This parser validates types and surfaces any bad rows with a clear error.
"""

from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import SupportsInt, cast

import pandas as pd

from src.domain.models import (
    DEFAULT_TAX_RATE,
    Operation,
    OperationType,
    Position,
)
from src.domain.parsing.numeric import parse_tax_rate as _parse_tax_rate
from src.domain.parsing.price_lookup import PriceLookup
from src.domain.parsing.replay import (
    ReplayResult,
    annotate_realized_gains,
    replay_holdings,
)
from src.domain.utils import month_end_dates
from src.infrastructure.parsers.base import default_snapshot_dates
from src.ports.parsers import BrokerLoader


@dataclass
class DirectLoader(BrokerLoader):
    """BrokerLoader for one pre-formatted direct/*.csv file.

    A single file can hold several accounts (the "account" column varies
    per row) — compute_positions() already groups by (account, asset_key)
    internally, so the loader doesn't need an account parameter.
    """

    filepath: Path

    @property
    def label(self) -> str:
        return f"direct/{self.filepath.name}"

    def load(
        self, ticker_map: dict[str, dict], asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position]]:
        operations = parse_operations(self.filepath)
        positions = compute_positions(
            operations,
            asset_prices=asset_prices,
            snapshot_dates=month_end_dates(operations),
        )
        return operations, positions


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_REQUIRED_COLUMNS = {
    "date",
    "account",
    "isin",
    "ticker",
    "name",
    "operation_type",
    "quantity",
    "price_per_unit",
    "total_amount",
    "currency",
}

_VALID_OPERATION_TYPES = {t.value for t in OperationType}


def _opt_float(value) -> float | None:
    if pd.isna(value) or str(value).strip() == "":
        return None
    try:
        return float(str(value).strip())
    except ValueError as exc:
        raise ValueError(f"Cannot parse float: {value!r}") from exc


def _opt_str(value) -> str | None:
    if pd.isna(value) or str(value).strip() == "":
        return None
    return str(value).strip()


def parse_operations(filepath: str | Path) -> list[Operation]:
    """Load and validate a pre-formatted misc CSV, return Operations."""
    path = Path(filepath)
    df = pd.read_csv(path, dtype=str)
    df.columns = [c.strip() for c in df.columns]

    missing = _REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"{path.name}: missing columns: {sorted(missing)}")

    operations: list[Operation] = []
    errors: list[str] = []

    for i, row in df.iterrows():
        line = int(cast(SupportsInt, i)) + 2  # 1-based + header row

        date_str = str(row["date"]).strip()
        try:
            dt = datetime.fromisoformat(date_str)
        except ValueError:
            errors.append(f"line {line}: invalid date {date_str!r}")
            continue

        op_type_raw = str(row["operation_type"]).strip().upper()
        if op_type_raw not in _VALID_OPERATION_TYPES:
            errors.append(
                f"line {line}: unknown operation_type {op_type_raw!r}"
                f" (valid: {sorted(_VALID_OPERATION_TYPES)})"
            )
            continue

        try:
            total_amount = _opt_float(row["total_amount"])
        except ValueError as exc:
            errors.append(f"line {line}: total_amount — {exc}")
            continue

        if total_amount is None:
            errors.append(f"line {line}: total_amount is required")
            continue

        try:
            quantity = _opt_float(row["quantity"])
            price_per_unit = _opt_float(row["price_per_unit"])
        except ValueError as exc:
            errors.append(f"line {line}: {exc}")
            continue

        currency = _opt_str(row["currency"]) or "EUR"
        account = str(row["account"]).strip()

        operations.append(
            Operation(
                date=dt,
                account=account,
                isin=_opt_str(row["isin"]),
                ticker=_opt_str(row["ticker"]),
                name=_opt_str(row["name"]),
                operation_type=OperationType(op_type_raw),
                quantity=quantity,
                price_per_unit=price_per_unit,
                total_amount=total_amount,
                currency=currency,
                tax_rate=_parse_tax_rate(row.get("tax_rate"), default=None),
                realized_tax_rate=_parse_tax_rate(
                    row.get("realized_tax_rate"), default=None
                ),
                dividend_tax_rate=_parse_tax_rate(
                    row.get("dividend_tax_rate"), default=None
                ),
            )
        )

    if errors:
        summary = "\n  ".join(errors)
        raise ValueError(f"{path.name}: validation errors:\n  {summary}")

    return operations


_CASH_TYPES = {
    OperationType.DEPOSIT,
    OperationType.WITHDRAWAL,
    OperationType.INTEREST,
}
_TRADE_TYPES = {OperationType.BUY, OperationType.SELL}


def compute_positions(
    operations: list[Operation],
    asset_prices: pd.DataFrame | None = None,
    snapshot_dates: list[date] | None = None,
) -> list[Position]:
    """Compute monthly positions from direct operations.

    Two modes per asset group:
    - Cash (only DEPOSIT/WITHDRAWAL/INTEREST): position = running balance,
      avg_buy_price = net deposits, unrealized_gain = accumulated interest.
    - Units (has BUY/SELL): replay cost basis like boursorama, falling
      back to the latest known price from a prior month, then to
      avg_buy_price if no market price was ever available.
    """
    if not operations:
        return []

    snapshot_dates = default_snapshot_dates(
        snapshot_dates, lambda: month_end_dates(operations)
    )

    # Price lookup tries isin -> ticker -> name (whichever is set)
    price_lookup = PriceLookup(
        asset_prices, key_columns=("isin", "ticker", "name")
    )

    # Group by (account, asset_key)
    def _key(op: Operation) -> tuple[str, str]:
        return (op.account, op.isin or op.ticker or op.name or "")

    groups: dict[tuple[str, str], list[Operation]] = {}
    for op in sorted(operations, key=lambda o: o.date):
        groups.setdefault(_key(op), []).append(op)

    positions: list[Position] = []

    for (account, asset_id), ops in groups.items():
        op_types = {op.operation_type for op in ops}
        is_unit_based = bool(op_types & _TRADE_TYPES)
        first = ops[0]
        isin = first.isin
        ticker = first.ticker
        name = first.name or asset_id
        currency = first.currency or "EUR"

        # Tax rate for unrealized gain: use last SELL's tax_rate, else 30%
        sell_rates = [
            o.tax_rate
            for o in ops
            if o.operation_type == OperationType.SELL
            and o.tax_rate is not None
        ]
        asset_tax_rate = sell_rates[-1] if sell_rates else DEFAULT_TAX_RATE

        # Tax rate for realized gain: use last SELL's realized_tax_rate if set,
        # else same as unrealized (means gain is gross, tax still owed)
        sell_realized_rates = [
            o.realized_tax_rate
            for o in ops
            if o.operation_type == OperationType.SELL
            and o.realized_tax_rate is not None
        ]
        asset_realized_tax_rate = (
            sell_realized_rates[-1] if sell_realized_rates else None
        )

        # Tax rate for dividends: use last DIVIDEND's dividend_tax_rate if set,
        # else same as unrealized (means dividends are gross, tax still owed)
        div_rates = [
            o.dividend_tax_rate
            for o in ops
            if o.operation_type == OperationType.DIVIDEND
            and o.dividend_tax_rate is not None
        ]
        asset_dividend_tax_rate = div_rates[-1] if div_rates else None

        if is_unit_based:
            # --- Unit-based: replay BUY/SELL to track quantity & cost
            # basis ---
            trade_ops = [o for o in ops if o.operation_type in _TRADE_TYPES]

            # All trade_ops share the same asset_id (already grouped above),
            # so the generic replay engine is keyed by a single constant key.
            # (key_id is bound as a default arg, not captured by closure, so
            # it can't ever go stale even if key_fn outlived this iteration.)
            key_id = isin or ticker or name
            annotate_realized_gains(
                trade_ops, key_fn=lambda op, key_id=key_id: key_id
            )

            for snap_date in snapshot_dates:
                result = replay_holdings(
                    trade_ops,
                    snap_date,
                    key_fn=lambda op, key_id=key_id: key_id,
                ).get(key_id, ReplayResult())
                quantity = result.quantity
                total_cost = result.total_cost
                realized_gain = result.realized_gain

                if quantity < 0.0001:
                    continue

                avg_buy_price = total_cost / quantity
                yr, mo = snap_date.year, snap_date.month
                last_price = (
                    price_lookup.get_price_eur_or_price_or_latest(
                        yr, mo, isin
                    )
                    if isin
                    else price_lookup.get_price_eur_or_price_or_latest(
                        yr, mo, ticker
                    )
                    if ticker
                    else price_lookup.get_price_eur_or_price_or_latest(
                        yr, mo, name
                    )
                    if name
                    else None
                )
                if last_price is None:
                    last_price = avg_buy_price

                total_value = round(quantity * last_price, 2)
                cost_basis = round(quantity * avg_buy_price, 2)
                unrealized_gain = round(total_value - cost_basis, 2)
                unrealized_gain_pct = (
                    round(unrealized_gain / cost_basis * 100, 4)
                    if cost_basis
                    else 0.0
                )

                positions.append(
                    Position(
                        snapshot_date=snap_date,
                        account=account,
                        isin=isin,
                        ticker=ticker,
                        name=name,
                        quantity=round(quantity, 6),
                        avg_buy_price=round(avg_buy_price, 6),
                        last_price=round(last_price, 6),
                        total_value=total_value,
                        unrealized_gain=unrealized_gain,
                        unrealized_gain_pct=unrealized_gain_pct,
                        realized_gain=round(realized_gain, 2),
                        currency=currency,
                        tax_rate=asset_tax_rate,
                        realized_tax_rate=asset_realized_tax_rate,
                        dividend_tax_rate=asset_dividend_tax_rate,
                    )
                )

        else:
            # --- Cash-based: running balance of
            # DEPOSIT/WITHDRAWAL/INTEREST ---
            for snap_date in snapshot_dates:
                net_deposits = 0.0
                interest_earned = 0.0

                for op in ops:
                    if op.date.date() > snap_date:
                        break
                    if op.operation_type in (
                        OperationType.DEPOSIT,
                        OperationType.WITHDRAWAL,
                    ):
                        net_deposits += op.total_amount
                    elif op.operation_type == OperationType.INTEREST:
                        interest_earned += op.total_amount

                balance = net_deposits + interest_earned
                if balance <= 0.0001:
                    continue

                # Interest is already tracked in total_interest — not
                # unrealized gain
                positions.append(
                    Position(
                        snapshot_date=snap_date,
                        account=account,
                        isin=isin,
                        ticker=ticker,
                        name=name,
                        quantity=1.0,
                        avg_buy_price=round(balance, 2),
                        last_price=round(balance, 2),
                        total_value=round(balance, 2),
                        unrealized_gain=0.0,
                        unrealized_gain_pct=0.0,
                        realized_gain=0.0,
                        currency=currency,
                        tax_rate=0.0,  # savings account interest is tax-exempt
                    )
                )

    return positions
