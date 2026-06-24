"""Concrete AllocationRepository: reads data/input/allocations/*.xlsx.

The xlsx is the single source of truth for ISIN, yahoo_symbol, currency and
allocation weights. Three optional columns (searched by header label in
row 1) extend the base format:

  yahoo_symbol  -- Yahoo Finance download symbol when different from ISIN
                   (leave empty if the ISIN is downloadable directly)
  currency      -- price currency (EUR, USD, GBP, ...)
  ticker        -- Revolut / alternative lookup ticker when different from
                   ISIN (e.g. AZEH, XDEE); leave empty for Boursorama
                   ISIN-keyed assets
"""

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import pandas as pd

from src.ports.allocation_repository import AllocationRepository

# Column ranges in the xlsx (inclusive start, exclusive end)
_CATEGORY_RANGES: dict[str, tuple[int, int]] = {
    "geo": (2, 12),
    "secteur": (12, 26),
    "currency": (26, 30),
    "classe": (30, 39),
}

_AUTRE_LABEL: dict[str, str] = {
    "geo": "autre",
    "secteur": "autre",
    "currency": "Autre",
    "classe": "autre",
}

_NC_LABEL = "nc"
_HEADER_ROW = 1
_DATA_START = 2
_KEY_COL = 0
_ID_COL = 1

# Labels searched in row 1 for optional meta columns
_YAHOO_ALIASES = ("yahoo_symbol", "yahoo")
_CURRENCY_ALIASES = ("currency", "devise", "cur")
_TICKER_ALIASES = ("ticker", "revolut_ticker")


def _normalize_col(raw: str, category: str) -> str:
    name = str(raw).strip()
    if category == "currency" and name.upper() == "AUTRE":
        return "Autre"
    return name.lower()


def _find_col(headers_row1: pd.Series, aliases: tuple[str, ...]) -> int | None:
    """Return the first column index whose row-1 label matches one of
    the aliases.
    """
    normalized = headers_row1.fillna("").astype(str).str.strip().str.lower()
    for i, h in enumerate(normalized):
        if h in aliases:
            return i
    return None


def _read_xlsx_meta(path: Path) -> pd.DataFrame:
    """Read meta columns from xlsx: nom_placement, id (ISIN),
    yahoo_symbol, currency.

    Always returns at least nom_placement and id columns.
    yahoo_symbol and currency are added when found in row 1.
    """
    df_raw = pd.read_excel(path, header=None)
    headers_row1 = df_raw.iloc[_HEADER_ROW, :]

    meta = (
        df_raw.iloc[_DATA_START:, [_KEY_COL, _ID_COL]]
        .copy()
        .reset_index(drop=True)
    )
    meta.columns = pd.Index(["nom_placement", "id"])

    for col_name, aliases in [
        ("yahoo_symbol", _YAHOO_ALIASES),
        ("currency", _CURRENCY_ALIASES),
        ("ticker", _TICKER_ALIASES),
    ]:
        col_idx = _find_col(headers_row1, aliases)
        if col_idx is not None:
            meta[col_name] = (
                df_raw.iloc[_DATA_START:, col_idx]
                .reset_index(drop=True)
                .fillna("")
                .astype(str)
                .str.strip()
                .replace("nan", "")
            )

    return meta


def _load_allocation_xlsx(
    path: Path,
) -> dict[str, tuple[pd.DataFrame, list[str]]]:
    """Return {category: (df_with_meta_and_values, value_cols)}."""
    df_raw = pd.read_excel(path, header=None)
    result: dict[str, tuple[pd.DataFrame, list[str]]] = {}

    headers_row1 = df_raw.iloc[_HEADER_ROW, :]

    meta_raw = (
        df_raw.iloc[_DATA_START:, [_KEY_COL, _ID_COL]]
        .copy()
        .reset_index(drop=True)
    )
    meta_raw.columns = pd.Index(["nom_placement", "id"])

    # Read optional meta columns
    for col_name, aliases in [
        ("yahoo_symbol", _YAHOO_ALIASES),
        ("currency", _CURRENCY_ALIASES),
        ("ticker", _TICKER_ALIASES),
    ]:
        col_idx = _find_col(headers_row1, aliases)
        if col_idx is not None:
            meta_raw[col_name] = (
                df_raw.iloc[_DATA_START:, col_idx]
                .reset_index(drop=True)
                .fillna("")
                .astype(str)
                .str.strip()
                .replace("nan", "")
            )

    for category, (col_start, col_end) in _CATEGORY_RANGES.items():
        autre = _AUTRE_LABEL[category]

        raw_headers = df_raw.iloc[_HEADER_ROW, col_start:col_end]
        value_cols = [_normalize_col(h, category) for h in raw_headers]

        raw_data = (
            df_raw.iloc[_DATA_START:, col_start:col_end]
            .copy()
            .reset_index(drop=True)
        )
        raw_data.columns = pd.Index(value_cols)

        df = pd.concat([meta_raw.copy(), raw_data], axis=1)

        for col in value_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        non_autre_cols = [c for c in value_cols if c != autre]
        non_autre_sum = df[non_autre_cols].sum(axis=1)
        substantive_cols = [
            c for c in value_cols if c not in (autre, _NC_LABEL)
        ]
        has_data = df[substantive_cols].sum(axis=1) > 0
        clean_mask = non_autre_sum <= 100

        fill_autre = clean_mask & has_data
        df.loc[fill_autre, autre] = (100 - non_autre_sum[fill_autre]).clip(
            lower=0
        )
        fill_nc = clean_mask & ~has_data
        df.loc[fill_nc, _NC_LABEL] = 100.0

        df = df[clean_mask].copy().reset_index(drop=True)
        result[category] = (df, value_cols)

    return result


@dataclass
class XlsxAllocationRepository(AllocationRepository):
    allocations_dir: Path
    _tables_cache: dict[Path, dict[str, tuple[pd.DataFrame, list[str]]]] = (
        field(default_factory=dict, init=False, repr=False)
    )

    def file_dates(self) -> list[tuple[date, Path]]:
        dates: list[tuple[date, Path]] = []
        for f in sorted(self.allocations_dir.glob("????-??-??.xlsx")):
            try:
                d = pd.to_datetime(f.stem).date()
                dates.append((d, f))
            except Exception:
                pass
        return dates

    def load_ticker_data(self) -> dict[str, dict]:
        """Ticker/ISIN/currency data from the most recent allocations xlsx.

        Returns {yahoo_key: {key, isin, yahoo_symbol, name, currency}} where
        yahoo_key = yahoo_symbol (if set) else isin.

        Assets with neither isin nor yahoo_symbol are skipped.
        """
        dates = self.file_dates()
        if not dates:
            return {}

        _, latest_file = max(dates, key=lambda x: x[0])
        meta = _read_xlsx_meta(latest_file)

        result: dict[str, dict] = {}
        for _, row in meta.iterrows():
            name = str(row.get("nom_placement", "") or "").strip()
            isin = str(row.get("id", "") or "").strip().replace("nan", "")
            yahoo_symbol = (
                str(row.get("yahoo_symbol", "") or "")
                .strip()
                .replace("nan", "")
            )
            currency = (
                str(row.get("currency", "") or "").strip().replace("nan", "")
            )
            revolut_ticker = (
                str(row.get("ticker", "") or "").strip().replace("nan", "")
            )

            # Actual Yahoo Finance download symbol: override if set, else ISIN
            yahoo_sym = yahoo_symbol if yahoo_symbol else isin

            # Entry keyed by ISIN (Boursorama assets look up by ISIN)
            if isin:
                result[isin] = {
                    "key": isin,
                    "isin": isin,
                    "yahoo_symbol": yahoo_sym,
                    "name": name,
                    "currency": currency,
                }

            # Additional entry keyed by Revolut ticker (Revolut assets
            # use ticker)
            if revolut_ticker and revolut_ticker != isin:
                result[revolut_ticker] = {
                    "key": revolut_ticker,
                    "isin": isin,
                    "yahoo_symbol": yahoo_sym,
                    "name": name,
                    "currency": currency,
                }

        return result

    def load_allocation_tables(
        self, as_of: date
    ) -> dict[str, tuple[pd.DataFrame, list[str]]] | None:
        applicable = [(d, f) for d, f in self.file_dates() if d <= as_of]
        if not applicable:
            return None
        _, repart_file = max(applicable, key=lambda x: x[0])
        if repart_file not in self._tables_cache:
            self._tables_cache[repart_file] = _load_allocation_xlsx(
                repart_file
            )
        return self._tables_cache[repart_file]
