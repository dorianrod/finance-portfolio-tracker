"""Allocation time-series output.

Joins positions with allocation tables (read via an AllocationRepository,
see src.infrastructure.xlsx_allocation_repository) to produce one wide CSV
per category (geo, secteur, currency, classe):

  snapshot_date | <label_1> | <label_2> | ...

Every portfolio snapshot date is included. The most recent repartition file
whose date <= snapshot_date is applied; dates before the first repartition
file use that first known allocation so the dashboard can show the complete
portfolio history.
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


def _clean_text(pos_row: pd.Series, column: str) -> str:
    raw = pos_row.get(column)
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


# Cash held in plain bank accounts is part of the portfolio total, but its
# geographic/sector/etc. breakdown is not meaningful.  Keep it visible in the
# allocation charts without conflating it with genuinely unknown exposure.
_NOT_CONCERNED_ACCOUNT_CATEGORIES = frozenset({"checking", "savings"})
_NOT_CONCERNED_LABEL = "Not concerned"


def _is_not_concerned(pos_row: pd.Series) -> bool:
    category = pos_row.get("account_category")
    account_is_not_concerned = not pd.isna(category) and (
        str(category).strip().lower()
        in _NOT_CONCERNED_ACCOUNT_CATEGORIES
    )
    return account_is_not_concerned or _is_synthetic_cash(pos_row)


def _output_value_cols(value_cols: list[str]) -> list[str]:
    """Allocation columns plus the dashboard-only out-of-scope bucket."""
    return [*value_cols, _NOT_CONCERNED_LABEL]


def _allocation_indexes(
    df_alloc: pd.DataFrame,
) -> tuple[dict[str, int], dict[str, int], dict[str, int]]:
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
        name_to_idx.setdefault(_norm_key(str(row["nom_placement"])), idx_int)
        clean_to_idx.setdefault(
            _norm_clean(str(row["nom_placement"])), idx_int
        )
    return isin_to_idx, name_to_idx, clean_to_idx


def _matching_allocation_index(
    pos_row: pd.Series,
    indexes: tuple[dict[str, int], dict[str, int], dict[str, int]],
) -> int | None:
    isin_to_idx, name_to_idx, clean_to_idx = indexes
    isin = _clean_isin(pos_row)
    if isin and isin in isin_to_idx:
        return isin_to_idx[isin]

    name = str(pos_row.get("name", "") or "")
    norm_name = _norm_key(name)
    if norm_name in name_to_idx:
        return name_to_idx[norm_name]
    return clean_to_idx.get(_norm_clean(name))


def _with_non_applicable_cash(
    category: str,
    pos_row: pd.Series,
    pct_map: dict[str, float],
    class_table: tuple[pd.DataFrame, list[str]] | None,
    class_indexes: tuple[dict[str, int], dict[str, int], dict[str, int]]
    | None,
) -> dict[str, float]:
    """Move sector NC attributable to cash into Not concerned.

    Cash has no meaningful economic sector.  The transfer is capped by the
    existing NC percentage, so known sector exposure is never removed.
    """
    result = {**pct_map, _NOT_CONCERNED_LABEL: 0.0}
    if category != "secteur" or class_table is None or class_indexes is None:
        return result

    class_df, class_cols = class_table
    cash_col = next(
        (col for col in class_cols if _norm_key(col) == "cash / monetaire"),
        None,
    )
    class_idx = _matching_allocation_index(pos_row, class_indexes)
    if cash_col is None or class_idx is None:
        return result

    class_row = cast(pd.Series, class_df.loc[class_idx])
    cash_pct = max(float(class_row.get(cash_col, 0) or 0), 0.0)
    nc_pct = max(result.get("nc", 0.0), 0.0)
    transferred = min(cash_pct, nc_pct)
    result["nc"] = nc_pct - transferred
    result[_NOT_CONCERNED_LABEL] = transferred
    return result


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
        snapshot_date, account, account_type, isin, name, <label_1>, ...
    Each row retains its source account so the dashboard can scope both the
    current allocation and its history with the account filter.
    """
    file_dates = allocation_repo.file_dates()
    if not file_dates:
        return {}
    min_date = min(d for d, _ in file_dates)

    positions_df = positions_df.copy()
    positions_df["snapshot_date"] = pd.to_datetime(
        positions_df["snapshot_date"]
    ).dt.date
    snap_dates = sorted(positions_df["snapshot_date"].unique())
    if not snap_dates:
        return {}

    rows_by_cat: dict[str, list[dict]] = {}

    for snap_date in snap_dates:
        alloc = allocation_repo.load_allocation_tables(
            max(snap_date, min_date)
        )
        if alloc is None:
            continue
        snap_pos = positions_df[positions_df["snapshot_date"] == snap_date]
        class_table = alloc.get("classe")
        class_indexes = (
            _allocation_indexes(class_table[0])
            if class_table is not None
            else None
        )

        for category, (df_alloc, value_cols) in alloc.items():
            output_cols = _output_value_cols(value_cols)
            indexes = _allocation_indexes(df_alloc)

            for _, pos_row in snap_pos.iterrows():
                total_value = float(pos_row.get("total_value") or 0)
                if total_value <= 0:
                    continue

                isin = _clean_isin(pos_row)
                name = str(pos_row.get("name", "") or "").strip()
                scope = {
                    "account": _clean_text(pos_row, "account"),
                    "account_type": _clean_text(pos_row, "account_type"),
                }

                if _is_not_concerned(pos_row):
                    row_dict: dict[str, object] = {
                        "snapshot_date": snap_date.isoformat(),
                        **scope,
                        "isin": _isin_or_synthetic_key(isin, name),
                        "name": name,
                    }
                    for col in output_cols:
                        row_dict[col] = (
                            round(total_value, 2)
                            if col == _NOT_CONCERNED_LABEL
                            else 0.0
                        )
                    rows_by_cat.setdefault(category, []).append(row_dict)
                    continue

                alloc_idx = _matching_allocation_index(pos_row, indexes)

                pct_map: dict[str, float] | None = None
                if alloc_idx is not None:
                    alloc_row = cast(pd.Series, df_alloc.loc[alloc_idx])
                    pct_map = {
                        col: float(alloc_row.get(col, 0) or 0)
                        for col in value_cols
                    }

                if pct_map is None:
                    continue
                pct_map = _with_non_applicable_cash(
                    category,
                    pos_row,
                    pct_map,
                    class_table,
                    class_indexes,
                )

                row_dict: dict[str, object] = {
                    "snapshot_date": snap_date.isoformat(),
                    **scope,
                    "isin": _isin_or_synthetic_key(isin, name),
                    "name": name,
                }
                for col in output_cols:
                    row_dict[col] = (
                        round(total_value * pct_map[col] / 100, 2)
                        if col in pct_map
                        else 0.0
                    )
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
    snap_dates = sorted(positions_df["snapshot_date"].unique())
    if not snap_dates:
        return {}

    rows_by_cat: dict[str, list[dict]] = {}

    for snap_date in snap_dates:
        alloc = allocation_repo.load_allocation_tables(
            max(snap_date, min_date)
        )
        if alloc is None:
            continue
        snap_pos = positions_df[positions_df["snapshot_date"] == snap_date]
        class_table = alloc.get("classe")
        class_indexes = (
            _allocation_indexes(class_table[0])
            if class_table is not None
            else None
        )

        for category, (df_alloc, value_cols) in alloc.items():
            output_cols = _output_value_cols(value_cols)
            indexes = _allocation_indexes(df_alloc)

            montants: dict[str, float] = {col: 0.0 for col in output_cols}

            for _, pos_row in snap_pos.iterrows():
                total_value = float(pos_row.get("total_value") or 0)
                if total_value <= 0:
                    continue

                if _is_not_concerned(pos_row):
                    montants[_NOT_CONCERNED_LABEL] += total_value
                    continue

                alloc_idx = _matching_allocation_index(pos_row, indexes)

                pct_map: dict[str, float] | None = None
                if alloc_idx is not None:
                    alloc_row = cast(pd.Series, df_alloc.loc[alloc_idx])
                    pct_map = {
                        col: float(alloc_row.get(col, 0) or 0)
                        for col in value_cols
                    }

                if pct_map is None:
                    continue
                pct_map = _with_non_applicable_cash(
                    category,
                    pos_row,
                    pct_map,
                    class_table,
                    class_indexes,
                )

                for col in output_cols:
                    montants[col] += total_value * pct_map[col] / 100

            row_dict: dict[str, object] = {
                "snapshot_date": snap_date.isoformat()
            }
            for col in output_cols:
                row_dict[col] = round(montants[col], 2)
            rows_by_cat.setdefault(category, []).append(row_dict)

    return {
        cat: pd.DataFrame(rows) for cat, rows in rows_by_cat.items() if rows
    }
