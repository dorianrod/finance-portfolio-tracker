"""Allocation time-series output.

Joins positions with allocation tables (read via an AllocationRepository,
see src.infrastructure.xlsx_allocation_repository) to produce one wide CSV
per category (geo, secteur, currency, classe):

  snapshot_date | <label_1> | <label_2> | ...

Only snapshot dates >= the earliest repartition file are included.
The most recent repartition file whose date <= snapshot_date is applied
(forward-fill, no backward extrapolation).
"""

from __future__ import annotations

import re
import unicodedata
from typing import SupportsInt, cast

import pandas as pd

from src.ports.allocation_repository import AllocationRepository


def _norm_key(s: str) -> str:
    s = " ".join(str(s).split()).lower()
    return "".join(
        c
        for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )


def _norm_clean(s: str) -> str:
    """Like _norm_key but also unpacks parenthesised suffixes and removes
    ticker codes.

    Examples:
      "iShares MSCI EM UCITS ETF USD (Acc)"
        -> "ishares msci em ucits etf usd acc"
      "iShares S&P 500 Equal Weight (acc) O4J0"
        -> "ishares s&p 500 equal weight acc"
    """
    stripped = re.sub(r"\(([^)]*)\)", r" \1 ", str(s))
    stripped = re.sub(r"\b[A-Z0-9]{4}\b", " ", stripped)
    return _norm_key(stripped)


def _best_isin_match(
    xlsx_norm: str,
    xlsx_norms: list[str],
    ticker_entries: list[tuple[str, str]],
) -> str | None:
    """Return an ISIN for xlsx_norm using progressive name-matching
    strategies.
    """
    for norm_fn in (_norm_key, _norm_clean):
        xn = norm_fn(xlsx_norm)
        t_entries = [(norm_fn(raw), isin) for raw, isin in ticker_entries]

        # 1. Exact
        exact = [isin for tn, isin in t_entries if tn == xn]
        if exact:
            return exact[0]

        # 2. Best ticker prefix of xlsx name (ticker is shorter)
        candidates = [
            (tn, isin)
            for tn, isin in t_entries
            if len(tn) >= 4 and xn.startswith(tn)
        ]
        if candidates:
            best_tn, best_isin = max(candidates, key=lambda x: len(x[0]))
            all_xlsx = [norm_fn(xr) for xr in xlsx_norms]
            if sum(1 for axn in all_xlsx if axn.startswith(best_tn)) == 1:
                return best_isin

        # 3. Xlsx name as prefix of ticker name (xlsx is shorter)
        if len(xn) >= 4:
            rev = [(tn, isin) for tn, isin in t_entries if tn.startswith(xn)]
            if len(rev) == 1:
                return rev[0][1]

    return None


def _clean_isin(pos_row: pd.Series) -> str:
    """The position's ISIN, or "" when absent (pandas may store a missing
    value as NaN rather than an empty string, and str(nan) == "nan" would
    otherwise be mistaken for a real id).
    """
    raw = pos_row.get("isin")
    return "" if pd.isna(raw) else str(raw).strip()


def _is_synthetic_cash(pos_row: pd.Series) -> bool:
    """True for the "Cash <label>" positions PortfolioSnapshotBuilder
    synthesises for brokerage accounts' uninvested cash (see
    application/portfolio_snapshot_builder.py). These have no ISIN and no
    entry in the allocations xlsx -- there is nothing to research, it's
    just cash.
    """
    name = str(pos_row.get("name", "") or "")
    category = str(pos_row.get("account_category", "") or "")
    return category == "brokerage" and name.startswith("Cash ")


# Fixed 100% classification applied to synthetic broker cash positions,
# mirroring how plain cash accounts (Livret A, LDDS, ...) are classified
# by hand in the allocations xlsx -- but computed instead of requiring a
# manually-maintained row for every brokerage account's cash label.
_CASH_CATEGORY_TARGET: dict[str, str] = {
    "classe": "cash / monétaire",
    "geo": "france",
    "secteur": "nc",
    "currency": "eur",
}


def _cash_allocation_pct(
    category: str, value_cols: list[str]
) -> dict[str, float] | None:
    target = _CASH_CATEGORY_TARGET.get(category)
    if target is None or target not in value_cols:
        return None
    return {col: (100.0 if col == target else 0.0) for col in value_cols}


def _isin_or_synthetic_key(isin: str, name: str) -> str:
    """Stable per-asset key for the by-isin CSV when a position has no
    real ISIN (bank cash accounts, broker uninvested cash): falling back
    to "" would collide every such position under the same blank key.
    """
    return isin or f"NC-{name}"


def build_positions_allocation_by_isin(
    positions_df: pd.DataFrame,
    allocation_repo: AllocationRepository,
) -> dict[str, pd.DataFrame]:
    """Generate per-ISIN allocation time-series DataFrames.

    Returns {category: df} where df has columns:
        snapshot_date, isin, name, <label_1>, <label_2>, ...
    Each row is one (snapshot_date, isin) pair with monetary amounts.
    """
    file_dates = allocation_repo.file_dates()
    if not file_dates:
        return {}
    min_date = min(d for d, _ in file_dates)

    positions_df = positions_df.copy()
    positions_df["snapshot_date"] = pd.to_datetime(
        positions_df["snapshot_date"]
    ).dt.date
    snap_dates = sorted(
        positions_df[positions_df["snapshot_date"] >= min_date][
            "snapshot_date"
        ].unique()
    )
    if not snap_dates:
        return {}

    rows_by_cat: dict[str, list[dict]] = {}

    for snap_date in snap_dates:
        alloc = allocation_repo.load_allocation_tables(snap_date)
        if alloc is None:
            continue
        snap_pos = positions_df[positions_df["snapshot_date"] == snap_date]

        for category, (df_alloc, value_cols) in alloc.items():
            valid_id = (
                df_alloc["id"].notna()
                & (df_alloc["id"].astype(str).str.strip() != "")
                & (df_alloc["id"].astype(str) != "nan")
            )
            isin_to_idx: dict[str, int] = {}
            for idx, row in df_alloc[valid_id].iterrows():
                isin_str = str(row["id"]).strip()
                if isin_str not in isin_to_idx:
                    isin_to_idx[isin_str] = int(cast(SupportsInt, idx))

            name_to_idx: dict[str, int] = {}
            clean_to_idx: dict[str, int] = {}
            for idx, row in df_alloc.iterrows():
                idx_int = int(cast(SupportsInt, idx))
                k = _norm_key(str(row["nom_placement"]))
                if k not in name_to_idx:
                    name_to_idx[k] = idx_int
                kc = _norm_clean(str(row["nom_placement"]))
                if kc not in clean_to_idx:
                    clean_to_idx[kc] = idx_int

            for _, pos_row in snap_pos.iterrows():
                total_value = float(pos_row.get("total_value") or 0)
                if total_value <= 0:
                    continue

                isin = _clean_isin(pos_row)
                name = str(pos_row.get("name", "") or "").strip()

                alloc_idx: int | None = None
                if isin and isin in isin_to_idx:
                    alloc_idx = isin_to_idx[isin]
                if alloc_idx is None:
                    norm_name = _norm_key(name)
                    if norm_name in name_to_idx:
                        alloc_idx = name_to_idx[norm_name]
                if alloc_idx is None:
                    clean_name = _norm_clean(name)
                    if clean_name in clean_to_idx:
                        alloc_idx = clean_to_idx[clean_name]

                pct_map: dict[str, float] | None = None
                if alloc_idx is not None and isin:
                    alloc_row = cast(pd.Series, df_alloc.loc[alloc_idx])
                    pct_map = {
                        col: float(alloc_row.get(col, 0) or 0)
                        for col in value_cols
                    }
                elif _is_synthetic_cash(pos_row):
                    pct_map = _cash_allocation_pct(category, value_cols)

                if pct_map is None:
                    continue

                row_dict: dict[str, object] = {
                    "snapshot_date": snap_date.isoformat(),
                    "isin": _isin_or_synthetic_key(isin, name),
                    "name": name,
                }
                for col in value_cols:
                    row_dict[col] = round(total_value * pct_map[col] / 100, 2)
                rows_by_cat.setdefault(category, []).append(row_dict)

    return {
        cat: pd.DataFrame(rows) for cat, rows in rows_by_cat.items() if rows
    }


def build_positions_allocation(
    positions_df: pd.DataFrame,
    allocation_repo: AllocationRepository,
) -> dict[str, pd.DataFrame]:
    """Generate wide allocation time-series DataFrames from positions.

    Returns {category: df} where df has columns:
        snapshot_date, <label_1>, <label_2>, ...
    """
    file_dates = allocation_repo.file_dates()
    if not file_dates:
        return {}
    min_date = min(d for d, _ in file_dates)

    positions_df = positions_df.copy()
    positions_df["snapshot_date"] = pd.to_datetime(
        positions_df["snapshot_date"]
    ).dt.date
    snap_dates = sorted(
        positions_df[positions_df["snapshot_date"] >= min_date][
            "snapshot_date"
        ].unique()
    )
    if not snap_dates:
        return {}

    rows_by_cat: dict[str, list[dict]] = {}

    for snap_date in snap_dates:
        alloc = allocation_repo.load_allocation_tables(snap_date)
        if alloc is None:
            continue
        snap_pos = positions_df[positions_df["snapshot_date"] == snap_date]

        for category, (df_alloc, value_cols) in alloc.items():
            valid_id = (
                df_alloc["id"].notna()
                & (df_alloc["id"].astype(str).str.strip() != "")
                & (df_alloc["id"].astype(str) != "nan")
            )
            isin_to_idx: dict[str, int] = {}
            for idx, row in df_alloc[valid_id].iterrows():
                isin_str = str(row["id"]).strip()
                if isin_str not in isin_to_idx:
                    isin_to_idx[isin_str] = int(cast(SupportsInt, idx))

            name_to_idx: dict[str, int] = {}
            clean_to_idx: dict[str, int] = {}
            for idx, row in df_alloc.iterrows():
                idx_int = int(cast(SupportsInt, idx))
                k = _norm_key(str(row["nom_placement"]))
                if k not in name_to_idx:
                    name_to_idx[k] = idx_int
                kc = _norm_clean(str(row["nom_placement"]))
                if kc not in clean_to_idx:
                    clean_to_idx[kc] = idx_int

            montants: dict[str, float] = {col: 0.0 for col in value_cols}

            for _, pos_row in snap_pos.iterrows():
                total_value = float(pos_row.get("total_value") or 0)
                if total_value <= 0:
                    continue

                alloc_idx: int | None = None

                isin = _clean_isin(pos_row)
                if isin and isin in isin_to_idx:
                    alloc_idx = isin_to_idx[isin]

                if alloc_idx is None:
                    norm_name = _norm_key(str(pos_row.get("name", "") or ""))
                    if norm_name in name_to_idx:
                        alloc_idx = name_to_idx[norm_name]

                if alloc_idx is None:
                    clean_name = _norm_clean(
                        str(pos_row.get("name", "") or "")
                    )
                    if clean_name in clean_to_idx:
                        alloc_idx = clean_to_idx[clean_name]

                pct_map: dict[str, float] | None = None
                if alloc_idx is not None:
                    alloc_row = cast(pd.Series, df_alloc.loc[alloc_idx])
                    pct_map = {
                        col: float(alloc_row.get(col, 0) or 0)
                        for col in value_cols
                    }
                elif _is_synthetic_cash(pos_row):
                    pct_map = _cash_allocation_pct(category, value_cols)

                if pct_map is None:
                    continue

                for col in value_cols:
                    montants[col] += total_value * pct_map[col] / 100

            row_dict: dict[str, object] = {
                "snapshot_date": snap_date.isoformat()
            }
            for col in value_cols:
                row_dict[col] = round(montants[col], 2)
            rows_by_cat.setdefault(category, []).append(row_dict)

    return {
        cat: pd.DataFrame(rows) for cat, rows in rows_by_cat.items() if rows
    }
