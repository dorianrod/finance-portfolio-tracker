"""Index asset_prices rows by (year, month, key) for the statement parsers.

Two access modes, matching how parsers actually use price data:
  - get_row() / get_row_or_latest(): the full price row (currency, name,
    ...), keyed by the RAW column value — used by boursorama/revolut,
    which need more than a bare price.
  - get_price_eur_or_price() / get_price_eur_or_price_or_latest(): a scalar
    price (price_eur if present, else price), keyed by the *stripped*
    column value, first-row-wins on collisions — used by direct.py, which
    tries isin -> ticker -> name.

The "_or_latest" variants fall back to the most recent prior month with a
price for that key when the exact (year, month) is missing — e.g. a Yahoo
Finance fetch failure for the current month shouldn't make a position's
value collapse to its cost basis; carrying the last known market price
forward is a much better estimate. They never look *ahead* in time, to
avoid look-ahead bias on historical snapshots.

Both indexes are built from the same `asset_prices` DataFrame and
`key_columns`; each parser only ever queries the accessor it needs.
"""

import bisect
from typing import SupportsInt, cast

import pandas as pd


class PriceLookup:
    def __init__(
        self,
        asset_prices: pd.DataFrame | None,
        key_columns: tuple[str, ...] = ("isin",),
    ) -> None:
        self._rows: dict[tuple[int, int, str], dict] = {}
        self._prices: dict[tuple[int, int, str], float] = {}
        self._row_months: dict[str, list[tuple[int, int]]] = {}
        self._price_months: dict[str, list[tuple[int, int]]] = {}

        if (
            asset_prices is None
            or asset_prices.empty
            or "date" not in asset_prices.columns
        ):
            return

        dates = pd.to_datetime(asset_prices["date"], errors="coerce")

        # Row index: one column at a time, raw (unstripped) key, full row.
        for col in key_columns:
            if col not in asset_prices.columns:
                continue
            col_rows = asset_prices[
                asset_prices[col].notna() & (asset_prices[col] != "")
            ]
            col_dates = dates.loc[col_rows.index]
            for (yr, mo), grp in col_rows.groupby(
                [col_dates.dt.year, col_dates.dt.month]
            ):
                yr_int = int(cast(SupportsInt, yr))
                mo_int = int(cast(SupportsInt, mo))
                for _, r in grp.iterrows():
                    self._rows[(yr_int, mo_int, r[col])] = r.to_dict()
                    self._row_months.setdefault(r[col], []).append(
                        (yr_int, mo_int)
                    )

        # Scalar price index: every row, all columns, stripped key, first wins.
        for (yr, mo), grp in asset_prices.groupby(
            [dates.dt.year, dates.dt.month]
        ):
            yr_int = int(cast(SupportsInt, yr))
            mo_int = int(cast(SupportsInt, mo))
            for _, r in grp.iterrows():
                p_eur = r.get("price_eur")
                price = float(p_eur) if pd.notna(p_eur) else float(r["price"])
                for col in key_columns:
                    val = r.get(col)
                    if val and pd.notna(val) and str(val).strip():
                        key = (yr_int, mo_int, str(val).strip())
                        if key not in self._prices:
                            self._prices[key] = price
                            self._price_months.setdefault(
                                str(val).strip(), []
                            ).append((yr_int, mo_int))

        for months in self._row_months.values():
            months.sort()
        for months in self._price_months.values():
            months.sort()

    def get_row(self, year: int, month: int, key: str) -> dict | None:
        return self._rows.get((year, month, key))

    def get_row_or_latest(
        self, year: int, month: int, key: str
    ) -> dict | None:
        row = self._rows.get((year, month, key))
        if row is not None:
            return row
        latest = self._latest_month_at_or_before(
            self._row_months.get(key), year, month
        )
        return self._rows.get((*latest, key)) if latest else None

    def get_price_eur_or_price(
        self, year: int, month: int, key: str
    ) -> float | None:
        return self._prices.get((year, month, key))

    def get_price_eur_or_price_or_latest(
        self, year: int, month: int, key: str
    ) -> float | None:
        price = self._prices.get((year, month, key))
        if price is not None:
            return price
        latest = self._latest_month_at_or_before(
            self._price_months.get(key), year, month
        )
        return self._prices.get((*latest, key)) if latest else None

    @staticmethod
    def _latest_month_at_or_before(
        months: list[tuple[int, int]] | None, year: int, month: int
    ) -> tuple[int, int] | None:
        """Most recent (yr, mo) in the sorted `months` list that is <=
        (year, month) — i.e. the latest known price that isn't from the
        future relative to the snapshot being valued.
        """
        if not months:
            return None
        idx = bisect.bisect_right(months, (year, month)) - 1
        return months[idx] if idx >= 0 else None
