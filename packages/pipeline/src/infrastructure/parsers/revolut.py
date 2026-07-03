import contextlib
import re
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import pandas as pd

from src.domain.models import Operation, OperationType, Position
from src.domain.parsing.numeric import parse_currency_prefixed_amount
from src.domain.parsing.price_lookup import PriceLookup
from src.domain.parsing.replay import annotate_realized_gains, replay_holdings
from src.domain.utils import month_end_dates
from src.infrastructure.parsers.base import default_snapshot_dates
from src.ports.parsers import BrokerLoader


@dataclass
class RevolutLoader(BrokerLoader):
    """BrokerLoader for the Revolut trading account export.

    Takes every matching export file rather than just the first one found:
    they all belong to the same account, so their operations are merged
    before replay (see BoursoramaLoader for why per-file replay would be
    wrong).
    """

    filepaths: list[Path]
    account: str = "revolut"
    label: str = "revolut"

    def load(
        self, ticker_map: dict[str, dict], asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position]]:
        operations: list[Operation] = []
        for filepath in self.filepaths:
            operations.extend(parse_operations(filepath, account=self.account))
        operations = _deduplicate(operations)
        _enrich_with_ticker_map(operations, ticker_map)

        if asset_prices.empty:
            print(
                f"[{self.label}] Warning: no asset prices available —"
                " positions skipped."
            )
            return operations, []

        positions = compute_positions(
            operations,
            asset_prices,
            account=self.account,
            snapshot_dates=month_end_dates(operations),
        )
        return operations, positions


# ---------------------------------------------------------------------------
# Helpers


def _deduplicate(operations: list[Operation]) -> list[Operation]:
    """Remove exact duplicates that arise when Revolut export files overlap.

    The historic file often includes the first few rows of the next monthly
    export. Deduplication key: (date, type, ticker, amount) — the tuple that
    uniquely identifies a transaction in Revolut's ledger.
    """
    seen: set[tuple] = set()
    unique: list[Operation] = []
    for op in operations:
        key = (op.date, op.operation_type, op.ticker, op.total_amount)
        if key not in seen:
            seen.add(key)
            unique.append(op)
    return unique
# ---------------------------------------------------------------------------

_OPERATION_MAP: dict[str, OperationType] = {
    "CASH TOP-UP": OperationType.DEPOSIT,
    "BUY - MARKET": OperationType.BUY,
    "BUY - LIMIT": OperationType.BUY,
    "BUY": OperationType.BUY,
    "SELL - MARKET": OperationType.SELL,
    "SELL - LIMIT": OperationType.SELL,
    "SELL": OperationType.SELL,
    "CASH WITHDRAWAL": OperationType.WITHDRAWAL,
    "DIVIDEND": OperationType.DIVIDEND,
}


def _map_operation(raw: str) -> OperationType:
    upper = raw.upper()
    for key in sorted(_OPERATION_MAP, key=len, reverse=True):
        if upper.startswith(key):
            return _OPERATION_MAP[key]
    return OperationType.DEPOSIT


def _enrich_with_ticker_map(
    operations: list[Operation], ticker_map: dict[str, dict]
) -> None:
    """Backfill isin/name on Revolut ops from the allocations xlsx
    (keyed by ticker).
    """
    ticker_to_meta: dict[str, dict] = {
        key: {"isin": v["isin"], "name": v["name"]}
        for key, v in ticker_map.items()
        if key != v.get("isin", "")
    }
    for op in operations:
        if op.ticker and op.ticker in ticker_to_meta:
            meta = ticker_to_meta[op.ticker]
            if not op.isin and meta.get("isin") not in (None, "", "nan"):
                op.isin = meta["isin"]
            if not op.name and meta.get("name") not in (None, "", "nan"):
                op.name = meta["name"]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def parse_operations(
    filepath: str | Path, account: str = "revolut"
) -> list[Operation]:
    """Parse a Revolut trading account statement CSV."""
    df = pd.read_csv(filepath, encoding="utf-8-sig", dtype=str)
    df.columns = [c.strip() for c in df.columns]

    operations: list[Operation] = []
    for _, row in df.iterrows():
        raw_type = str(row.get("Type", "")).strip()
        op_type = _map_operation(raw_type)

        ticker_raw = str(row.get("Ticker", "")).strip()
        ticker: str | None = (
            ticker_raw if ticker_raw and ticker_raw.lower() != "nan" else None
        )

        qty_raw = row.get("Quantity", None)
        quantity: float | None = None
        if pd.notna(qty_raw) and str(qty_raw).strip():
            with contextlib.suppress(ValueError):
                quantity = float(str(qty_raw).strip())

        price_raw = row.get("Price per share", None)
        price_per_unit: float | None = None
        if pd.notna(price_raw) and str(price_raw).strip():
            price_per_unit = parse_currency_prefixed_amount(price_raw)

        total_raw = row.get("Total Amount", None)
        total_amount = parse_currency_prefixed_amount(total_raw) or 0.0

        if op_type == OperationType.BUY:
            total_amount = -abs(total_amount)

        currency_raw = row.get("Currency", "EUR")
        currency = (
            str(currency_raw).strip() if pd.notna(currency_raw) else "EUR"
        )

        date_str = str(row.get("Date", "")).strip().replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(date_str)
            if dt.tzinfo is not None:
                dt = dt.replace(tzinfo=None)
        except ValueError:
            dt = datetime.now()

        operations.append(
            Operation(
                date=dt,
                account=account,
                isin=None,
                ticker=ticker,
                name=None,
                operation_type=op_type,
                quantity=quantity,
                price_per_unit=price_per_unit,
                total_amount=total_amount,
                currency=currency,
            )
        )

    return operations


def compute_positions(
    operations: list[Operation],
    asset_prices: pd.DataFrame,
    account: str = "revolut",
    snapshot_dates: list[date] | None = None,
) -> list[Position]:
    """Compute Revolut positions for each snapshot date by replaying
    operations.

    For each snap_date, replays BUY/SELL ops up to that date to derive
    quantity and avg_buy_price. Looks up price by (year, month, ticker),
    falling back to the latest known price from a prior month, then to
    avg_buy_price if no market price was ever available — a missing quote
    must never make a held position disappear from the snapshot.
    """
    snapshot_dates = default_snapshot_dates(
        snapshot_dates, lambda: [date.today()]
    )

    sorted_ops = sorted(
        (
            op
            for op in operations
            if op.ticker is not None
            and op.operation_type in (OperationType.BUY, OperationType.SELL)
        ),
        key=lambda op: op.date,
    )

    price_lookup = PriceLookup(asset_prices, key_columns=("ticker",))

    _ISIN_RE = re.compile(r"^[A-Z]{2}[A-Z0-9]{10}$")

    annotate_realized_gains(sorted_ops, key_fn=lambda op: op.ticker or "")

    positions: list[Position] = []

    for snap_date in snapshot_dates:
        holdings = replay_holdings(
            sorted_ops, snap_date, key_fn=lambda op: op.ticker or ""
        )

        for ticker, data in holdings.items():
            quantity = data.quantity
            if quantity <= 0:
                continue

            avg_buy_price = data.total_cost / quantity
            price_info = price_lookup.get_row_or_latest(
                snap_date.year, snap_date.month, ticker
            )

            if price_info is not None:
                price_eur = price_info.get("price_eur")
                last_price = (
                    float(price_eur)
                    if price_eur is not None and not pd.isna(price_eur)
                    else float(price_info["price"])
                )
                currency = str(price_info.get("currency", "EUR"))
                isin_from_map = str(price_info.get("isin", "")).strip()
                isin = (
                    isin_from_map
                    if isin_from_map and isin_from_map != "nan"
                    else (ticker if _ISIN_RE.match(ticker) else None)
                )
                name_raw = str(price_info.get("name", ticker)).strip()
                name = (
                    name_raw
                    if name_raw and name_raw not in ("nan", "TO_BE_FILLED")
                    else ticker
                )
            else:
                # No price ever found for this ticker — a missing quote
                # must never make a held position disappear from the
                # snapshot, so fall back to cost basis.
                last_price = avg_buy_price
                currency = "EUR"
                isin = ticker if _ISIN_RE.match(ticker) else None
                name = data.name or ticker

            cost_basis = quantity * avg_buy_price
            total_value = quantity * last_price
            unrealized_gain = total_value - cost_basis
            unrealized_gain_pct = (
                (unrealized_gain / cost_basis * 100)
                if cost_basis != 0
                else 0.0
            )

            positions.append(
                Position(
                    snapshot_date=snap_date,
                    account=account,
                    isin=isin,
                    ticker=ticker,
                    name=name,
                    quantity=quantity,
                    avg_buy_price=round(avg_buy_price, 6),
                    last_price=last_price,
                    total_value=round(total_value, 2),
                    unrealized_gain=round(unrealized_gain, 2),
                    unrealized_gain_pct=round(unrealized_gain_pct, 2),
                    realized_gain=round(data.realized_gain, 2),
                    currency=currency,
                )
            )

    return positions
