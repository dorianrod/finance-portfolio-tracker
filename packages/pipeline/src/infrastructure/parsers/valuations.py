"""Parser for periodic valuation CSV files.

The user provides asset values at known dates, along with how much capital
has been cumulatively invested. This separates cash contributions from
performance at each snapshot.

Expected columns:
    date, account, isin, ticker, name, value, invested, currency

Optional columns:
    quantity, proceeds, sale_price_per_unit, distribution, tax_rate,
    realized_tax_rate, dividend_tax_rate

- date      : valuation date (YYYY-MM-DD or ISO format)
- account   : account identifier (e.g. "fortuneo", "my_pe_fund")
- isin      : optional
- ticker    : optional
- name      : human-readable asset name (used as fallback key if no
              isin/ticker)
- value     : total current market value of the asset in `currency`
- invested  : cumulative capital committed to date (cost basis).
              If omitted on a row, the last known invested amount is carried
              forward (i.e. no new cash was added).
- quantity  : number of units held. When present, positions preserve real
              units and derive their average/last unit prices.
- proceeds  : observed sale proceeds when invested decreases. If omitted,
              proceeds are estimated from the previous proportional value.
- sale_price_per_unit: optional gross execution price for a unit sale.
- distribution: non-cumulative cash distribution paid out on that date.
- currency  : 3-letter code (default EUR)

Cash vs performance
-------------------
At each snapshot:
  unrealized_gain = value - invested  (pure performance)

When `invested` changes between two provided dates, balanced operations are
generated to describe both sides of the movement:

- an increase produces a DEPOSIT followed by a BUY for the invested delta;
- a decrease produces a SELL followed by a WITHDRAWAL for the proportional
  market value sold.

The DEPOSIT/WITHDRAWAL side is the external investor cash flow.  The
BUY/SELL side updates the asset's cost basis without leaving synthetic cash
behind in the account.

A positive `distribution` generates a DIVIDEND followed by a WITHDRAWAL for
the same amount. It therefore contributes to total return while leaving no
cash inside the tracked account.

Fill-forward
------------
Both `value` and `invested` are filled forward for months where no snapshot
is provided, up to today.
"""

from calendar import monthrange
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
from src.ports.parsers import BrokerLoader


@dataclass
class ValuationsLoader(BrokerLoader):
    """BrokerLoader for one valuations/*.csv file.

    Ignores both ticker_map and asset_prices: positions come from explicit
    value/invested columns, not market prices, and there's no ISIN/name
    backfill to do here (unlike RevolutLoader).
    """

    filepath: Path

    @property
    def label(self) -> str:
        return f"valuations/{self.filepath.name}"

    def load(
        self, ticker_map: dict[str, dict], asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position]]:
        return parse(self.filepath)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_REQUIRED_COLUMNS = {"date", "account", "name", "value", "currency"}


def _opt_str(value) -> str | None:
    if pd.isna(value) or str(value).strip() in ("", "nan"):
        return None
    return str(value).strip()


def _opt_float(value) -> float | None:
    if pd.isna(value) or str(value).strip() in ("", "nan"):
        return None
    try:
        return float(str(value).strip())
    except ValueError:
        return None


def _month_end_dates(start: date, end: date) -> list[date]:
    dates = []
    y, m = start.year, start.month
    while (y, m) <= (end.year, end.month):
        last_day = monthrange(y, m)[1]
        dates.append(min(date(y, m, last_day), end))
        m += 1
        if m > 12:
            m, y = 1, y + 1
    return dates


def _last_on_or_before(lookup: dict[date, float], snap: date) -> float | None:
    candidates = [(d, v) for d, v in lookup.items() if d <= snap]
    return max(candidates, key=lambda x: x[0])[1] if candidates else None


def parse(
    filepath: str | Path,
) -> tuple[list[Operation], list[Position]]:
    """Load and validate a valuations CSV; return (operations, positions)."""
    path = Path(filepath)
    df = pd.read_csv(path, dtype=str)
    df.columns = [c.strip() for c in df.columns]

    missing = _REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"{path.name}: missing columns: {sorted(missing)}")

    errors: list[str] = []
    rows: list[dict] = []

    for i, row in df.iterrows():
        line = int(cast(SupportsInt, i)) + 2

        date_str = str(row["date"]).strip()
        try:
            dt = datetime.fromisoformat(date_str).date()
        except ValueError:
            errors.append(f"line {line}: invalid date {date_str!r}")
            continue

        value = _opt_float(row["value"])
        if value is None:
            errors.append(f"line {line}: cannot parse value {row['value']!r}")
            continue

        # invested is optional — None means "no change"
        invested = _opt_float(row.get("invested"))

        rows.append(
            {
                "date": dt,
                "account": str(row["account"]).strip(),
                "isin": _opt_str(row.get("isin")),
                "ticker": _opt_str(row.get("ticker")),
                "name": str(row["name"]).strip(),
                "value": value,
                "invested": invested,
                "quantity": _opt_float(row.get("quantity")),
                "proceeds": _opt_float(row.get("proceeds")),
                "sale_price_per_unit": _opt_float(
                    row.get("sale_price_per_unit")
                ),
                "distribution": _opt_float(row.get("distribution")),
                "currency": _opt_str(row.get("currency")) or "EUR",
                "tax_rate": _parse_tax_rate(row.get("tax_rate"), default=None),
                "realized_tax_rate": _parse_tax_rate(
                    row.get("realized_tax_rate"), default=None
                ),
                "dividend_tax_rate": _parse_tax_rate(
                    row.get("dividend_tax_rate"), default=None
                ),
            }
        )

    if errors:
        raise ValueError(
            f"{path.name}: validation errors:\n  " + "\n  ".join(errors)
        )

    def asset_key(r: dict) -> tuple:
        return (r["account"], r["isin"] or r["ticker"] or r["name"])

    groups: dict[tuple, list[dict]] = {}
    for r in rows:
        k = asset_key(r)
        groups.setdefault(k, []).append(r)

    today = date.today()
    operations: list[Operation] = []
    positions: list[Position] = []

    for (account, _), asset_rows in groups.items():
        asset_rows.sort(key=lambda r: r["date"])

        first = asset_rows[0]
        isin = first["isin"]
        ticker = first["ticker"]
        name = first["name"]
        currency = first["currency"]

        # Resolve invested for the first row: default to value if not given
        first_invested = (
            first["invested"]
            if first["invested"] is not None
            else first["value"]
        )

        # Build lookup tables keyed by date
        known_value: dict[date, float] = {
            r["date"]: r["value"] for r in asset_rows
        }
        # Only keep dates where invested is explicitly provided
        known_invested: dict[date, float] = {
            r["date"]: r["invested"]
            for r in asset_rows
            if r["invested"] is not None
        }
        known_invested[first["date"]] = first_invested
        known_quantity: dict[date, float] = {
            r["date"]: r["quantity"]
            for r in asset_rows
            if r["quantity"] is not None
        }
        if known_quantity and first["date"] not in known_quantity:
            raise ValueError(
                f"{path.name}: quantity must be provided on the first "
                f"valuation row for {account!r}/{name!r}"
            )
        known_tax_rate: dict[date, float] = {
            r["date"]: r["tax_rate"]
            for r in asset_rows
            if r["tax_rate"] is not None
        }
        known_realized_tax_rate: dict[date, float] = {
            r["date"]: r["realized_tax_rate"]
            for r in asset_rows
            if r["realized_tax_rate"] is not None
        }
        known_dividend_tax_rate: dict[date, float] = {
            r["date"]: r["dividend_tax_rate"]
            for r in asset_rows
            if r["dividend_tax_rate"] is not None
        }

        # Generate balanced operations for capital movements:
        # - invested increases → DEPOSIT + BUY
        # - invested decreases → SELL + WITHDRAWAL,
        #   using the proportional share of the previous market value.
        prev_invested = 0.0
        prev_value = 0.0
        prev_quantity = 0.0
        tracks_quantity = first["date"] in known_quantity
        asset_sell_operations: list[Operation] = []
        for r in asset_rows:
            common = {
                "date": datetime.combine(r["date"], datetime.min.time()),
                "account": account,
                "isin": isin,
                "ticker": ticker,
                "name": name,
                "currency": currency,
            }
            snap_invested = known_invested.get(r["date"])
            snap_value = r["value"]
            snap_quantity = _last_on_or_before(
                known_quantity, r["date"]
            )
            if snap_invested is not None:
                delta = round(snap_invested - prev_invested, 2)
                if delta > 0:
                    quantity_delta = (
                        round(snap_quantity - prev_quantity, 6)
                        if tracks_quantity and snap_quantity is not None
                        else delta
                    )
                    buy_quantity = (
                        quantity_delta if quantity_delta > 0 else None
                    )
                    buy_price = (
                        round(delta / quantity_delta, 6)
                        if quantity_delta > 0
                        else None
                    )
                    operations.append(
                        Operation(
                            **common,
                            operation_type=OperationType.DEPOSIT,
                            total_amount=delta,
                        )
                    )
                    operations.append(
                        Operation(
                            **common,
                            operation_type=OperationType.BUY,
                            quantity=buy_quantity,
                            price_per_unit=buy_price,
                            total_amount=-delta,
                        )
                    )
                elif delta < 0 and prev_invested > 0:
                    if r["proceeds"] is not None:
                        proceeds = round(r["proceeds"], 2)
                    else:
                        sell_ratio = min(abs(delta) / prev_invested, 1.0)
                        proceeds = round(prev_value * sell_ratio, 2)
                    sold_quantity = (
                        round(prev_quantity - snap_quantity, 6)
                        if tracks_quantity and snap_quantity is not None
                        else abs(delta)
                    )
                    sell_price = r["sale_price_per_unit"]
                    if sell_price is None:
                        sell_price = (
                            round(proceeds / sold_quantity, 6)
                            if sold_quantity > 0
                            else round(prev_value / prev_invested, 6)
                        )
                    sell_operation = Operation(
                        **common,
                        operation_type=OperationType.SELL,
                        quantity=sold_quantity,
                        price_per_unit=sell_price,
                        total_amount=proceeds,
                        realized_gain=round(proceeds - abs(delta), 2),
                        realized_tax_rate=_last_on_or_before(
                            known_realized_tax_rate, r["date"]
                        ),
                    )
                    operations.append(sell_operation)
                    asset_sell_operations.append(sell_operation)
                    operations.append(
                        Operation(
                            **common,
                            operation_type=OperationType.WITHDRAWAL,
                            total_amount=-proceeds,
                        )
                    )

            distribution = r["distribution"] or 0.0
            if distribution > 0:
                operations.append(
                    Operation(
                        **common,
                        operation_type=OperationType.DIVIDEND,
                        total_amount=distribution,
                        dividend_tax_rate=_last_on_or_before(
                            known_dividend_tax_rate, r["date"]
                        ),
                    )
                )
                operations.append(
                    Operation(
                        **common,
                        operation_type=OperationType.WITHDRAWAL,
                        total_amount=-distribution,
                    )
                )
            if snap_invested is not None:
                prev_invested = snap_invested
            if snap_quantity is not None:
                prev_quantity = snap_quantity
            prev_value = snap_value

        # Fill-forward: monthly positions from first valuation to today
        snap_dates = _month_end_dates(first["date"], today)

        for snap_date in snap_dates:
            cur_value = _last_on_or_before(known_value, snap_date)
            cur_invested = _last_on_or_before(known_invested, snap_date)
            cur_quantity = _last_on_or_before(known_quantity, snap_date)
            cur_tax_rate = _last_on_or_before(known_tax_rate, snap_date)
            if cur_tax_rate is None:
                cur_tax_rate = DEFAULT_TAX_RATE
            cur_realized_tax_rate = _last_on_or_before(
                known_realized_tax_rate, snap_date
            )
            cur_dividend_tax_rate = _last_on_or_before(
                known_dividend_tax_rate, snap_date
            )

            if cur_value is None or cur_invested is None:
                continue
            if cur_value == 0:
                continue

            position_quantity = cur_quantity or 1.0
            avg_buy_price = cur_invested / position_quantity
            last_price = cur_value / position_quantity

            unrealized_gain = round(cur_value - cur_invested, 2)
            unrealized_gain_pct = (
                round(unrealized_gain / cur_invested * 100, 4)
                if cur_invested != 0
                else 0.0
            )

            positions.append(
                Position(
                    snapshot_date=snap_date,
                    account=account,
                    isin=isin,
                    ticker=ticker,
                    name=name,
                    quantity=round(position_quantity, 6),
                    avg_buy_price=round(avg_buy_price, 6),
                    last_price=round(last_price, 6),
                    total_value=round(cur_value, 2),
                    unrealized_gain=unrealized_gain,
                    unrealized_gain_pct=unrealized_gain_pct,
                    realized_gain=round(
                        sum(
                            op.realized_gain or 0.0
                            for op in asset_sell_operations
                            if op.date.date() <= snap_date
                        ),
                        2,
                    ),
                    currency=currency,
                    tax_rate=cur_tax_rate,
                    realized_tax_rate=cur_realized_tax_rate,
                    dividend_tax_rate=cur_dividend_tax_rate,
                )
            )

    return operations, positions
