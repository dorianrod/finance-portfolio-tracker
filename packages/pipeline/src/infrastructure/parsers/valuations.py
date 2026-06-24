"""Parser for periodic valuation CSV files.

The user provides asset values at known dates, along with how much capital
has been cumulatively invested. This separates cash contributions from
performance at each snapshot.

Expected columns:
    date, account, isin, ticker, name, value, invested, currency

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
- currency  : 3-letter code (default EUR)

Cash vs performance
-------------------
At each snapshot:
  unrealized_gain = value - invested  (pure performance)

When `invested` increases between two provided dates a synthetic BUY is
generated for the delta (the new capital call / deposit). This ensures that
the dashboard correctly reflects total capital deployed vs. market gains.

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
                "currency": _opt_str(row.get("currency")) or "EUR",
                "tax_rate": _parse_tax_rate(row.get("tax_rate"), default=None),
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
        known_tax_rate: dict[date, float] = {
            r["date"]: r["tax_rate"]
            for r in asset_rows
            if r["tax_rate"] is not None
        }

        # Generate BUY/SELL operations for capital movements:
        # - invested increases → BUY (new capital added)
        # - invested decreases → SELL (capital withdrawn),
        #   proceeds = proportional share of prev value
        prev_invested = 0.0
        prev_value = 0.0
        for r in asset_rows:
            snap_invested = known_invested.get(r["date"])
            if snap_invested is None:
                continue
            snap_value = known_value.get(r["date"], snap_invested)
            delta = round(snap_invested - prev_invested, 2)
            if delta > 0:
                operations.append(
                    Operation(
                        date=datetime.combine(r["date"], datetime.min.time()),
                        account=account,
                        isin=isin,
                        ticker=ticker,
                        name=name,
                        operation_type=OperationType.BUY,
                        quantity=delta,
                        price_per_unit=1.0,
                        total_amount=-delta,
                        currency=currency,
                    )
                )
            elif delta < 0 and prev_invested > 0:
                sell_ratio = min(abs(delta) / prev_invested, 1.0)
                proceeds = round(prev_value * sell_ratio, 2)
                operations.append(
                    Operation(
                        date=datetime.combine(r["date"], datetime.min.time()),
                        account=account,
                        isin=isin,
                        ticker=ticker,
                        name=name,
                        operation_type=OperationType.SELL,
                        quantity=abs(delta),
                        price_per_unit=round(prev_value / prev_invested, 6),
                        total_amount=proceeds,
                        currency=currency,
                    )
                )
            prev_invested = snap_invested
            prev_value = snap_value

        # Fill-forward: monthly positions from first valuation to today
        snap_dates = _month_end_dates(first["date"], today)

        for snap_date in snap_dates:
            cur_value = _last_on_or_before(known_value, snap_date)
            cur_invested = _last_on_or_before(known_invested, snap_date)
            cur_tax_rate = (
                _last_on_or_before(known_tax_rate, snap_date)
                or DEFAULT_TAX_RATE
            )

            if cur_value is None or cur_invested is None:
                continue
            if cur_value == 0:
                continue

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
                    quantity=1.0,
                    avg_buy_price=round(cur_invested, 2),
                    last_price=round(cur_value, 2),
                    total_value=round(cur_value, 2),
                    unrealized_gain=unrealized_gain,
                    unrealized_gain_pct=unrealized_gain_pct,
                    realized_gain=0.0,
                    currency=currency,
                    tax_rate=cur_tax_rate,
                )
            )

    return operations, positions
