#!/usr/bin/env python3
"""Read the current allocation values for an asset from the reference xlsx.

Usage:
    python read_allocation.py "ASSET NAME" [--file path/to/file.xlsx]
                                            [--data-dir path]
    python read_allocation.py --list-all [--file path/to/file.xlsx]
                                      [--data-dir path]

Output:
    JSON with the current values for each category (geo, secteur,
    currency, classe). Values are whole percentages (e.g. 50.0 for 50%).
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print(
        json.dumps(
            {
                "error": "pandas is not installed. "
                "Run: pip install pandas openpyxl"
            }
        )
    )
    sys.exit(1)

# Column ranges in the xlsx (inclusive start, exclusive end) — must match
# src/infrastructure/xlsx_allocation_repository.py's _CATEGORY_RANGES.
CATEGORY_RANGES: dict[str, tuple[int, int]] = {
    "geo": (2, 12),
    "secteur": (12, 26),
    "currency": (26, 30),
    "classe": (30, 39),
}

CATEGORY_LABELS = {
    "geo": "Geographic",
    "secteur": "Sector",
    "currency": "Currency",
    "classe": "Asset class",
}

HEADER_ROW_IDX = 1
DATA_START_IDX = 2
KEY_COL_IDX = 0
ID_COL_IDX = 1
REFERENCE_HEADER = "reference"

META_COLUMN_ALIASES = {
    "reference": ("reference",),
    "yahoo_symbol": ("yahoo_symbol", "yahoo"),
    "currency": ("currency", "devise", "cur"),
    "ticker": ("ticker", "revolut_ticker"),
}


def resolve_data_dir(cli_value: str | None) -> Path:
    """Same precedence as finance-pipeline's resolve_data_dir, with an
    existence-based fallback since this script has no --data-dir flag on
    finance-pipeline itself to inherit from.
    """
    if cli_value:
        return Path(cli_value).expanduser().resolve()
    env_value = os.environ.get("FINANCE_DATA_DIR")
    if env_value:
        return Path(env_value).expanduser().resolve()
    cwd = Path.cwd()
    if (cwd / "input").is_dir():
        return cwd
    return cwd / "data"


def latest_allocation_file(allocations_dir: Path) -> Path | None:
    files = sorted(allocations_dir.glob("????-??-??.xlsx"))
    return files[-1] if files else None


def _norm_key(s: str) -> str:
    """Normalize a key: strip, lowercase, strip accents, collapse spaces."""
    s = " ".join(str(s).split()).lower()
    return "".join(
        c
        for c in unicodedata.normalize("NFD", s)
        if unicodedata.category(c) != "Mn"
    )


def _find_reference_col(headers_row1: "pd.Series") -> int:
    normalized = headers_row1.fillna("").astype(str).str.strip().str.lower()
    for i, h in enumerate(normalized):
        if h == REFERENCE_HEADER:
            return i
    return len(headers_row1) - 1


def _find_col(headers_row1: "pd.Series", aliases: tuple[str, ...]) -> int | None:
    normalized = headers_row1.fillna("").astype(str).str.strip().str.lower()
    for i, h in enumerate(normalized):
        if h in aliases:
            return i
    return None


def _clean_cell(raw) -> str:
    if pd.isna(raw):
        return ""
    value = str(raw).strip()
    return "" if value.lower() == "nan" else value


def _list_all_assets(df_raw: "pd.DataFrame", file_path: Path) -> dict:
    headers_row1 = df_raw.iloc[HEADER_ROW_IDX, :]
    col_indexes = {
        name: _find_col(headers_row1, aliases)
        for name, aliases in META_COLUMN_ALIASES.items()
    }
    rows = []
    for _, row in df_raw.iloc[DATA_START_IDX:].iterrows():
        name = _clean_cell(row.iloc[KEY_COL_IDX])
        asset_id = _clean_cell(row.iloc[ID_COL_IDX])
        if not name and not asset_id:
            continue
        item = {
            "nom_placement": name,
            "ID": asset_id,
            "reference": "",
            "yahoo_symbol": "",
            "currency": "",
            "ticker": "",
        }
        for col_name, col_idx in col_indexes.items():
            if col_idx is not None and col_idx < len(row):
                item[col_name] = _clean_cell(row.iloc[col_idx])
        rows.append(item)
    return {"file": str(file_path.resolve()), "assets": rows}


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Read the current allocation for an asset from the reference "
            "xlsx."
        )
    )
    parser.add_argument(
        "asset_name",
        nargs="?",
        help="Name of the asset to look up",
    )
    parser.add_argument(
        "--list-all",
        action="store_true",
        help=(
            "List allocation metadata columns for all assets "
            "(nom_placement, ID, reference, yahoo_symbol, currency, ticker)."
        ),
    )
    parser.add_argument(
        "--file",
        default=None,
        help=(
            "Path to the xlsx file (default: latest "
            "<data-dir>/input/allocations/*.xlsx)"
        ),
    )
    parser.add_argument(
        "--data-dir",
        default=None,
        help=(
            "Data directory (default: $FINANCE_DATA_DIR, else . if "
            "./input exists, else ./data)"
        ),
    )
    args = parser.parse_args()

    allocations_dir = (
        resolve_data_dir(args.data_dir) / "input" / "allocations"
    )
    file_path = (
        Path(args.file)
        if args.file
        else latest_allocation_file(allocations_dir)
    )

    if file_path is None or not file_path.exists():
        print(
            json.dumps(
                {
                    "error": f"No allocation file found in {allocations_dir}",
                    "hint": (
                        "Pass --file path/to/YYYY-MM-DD.xlsx, or run "
                        "finance-init first."
                    ),
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)

    df_raw = pd.read_excel(file_path, header=None)
    if args.list_all:
        print(
            json.dumps(
                _list_all_assets(df_raw, file_path),
                ensure_ascii=False,
                indent=2,
            )
        )
        return

    if not args.asset_name:
        parser.error("asset_name is required unless --list-all is passed")

    norm_target = _norm_key(args.asset_name)

    data = df_raw.iloc[DATA_START_IDX:].reset_index(drop=True)
    key_series = data.iloc[:, KEY_COL_IDX].astype(str).map(_norm_key)

    # Try an exact match first, then fall back to a partial (substring) match.
    exact_matches = data[key_series == norm_target]
    if exact_matches.empty:
        partial = data[
            key_series.str.contains(norm_target, regex=False, na=False)
        ]
        if not partial.empty:
            matched_row = partial.iloc[0]
            matched_name = str(
                df_raw.iloc[DATA_START_IDX + partial.index[0], KEY_COL_IDX]
            )
        else:
            matched_row = None
            matched_name = None
    else:
        matched_row = exact_matches.iloc[0]
        matched_name = str(
            df_raw.iloc[DATA_START_IDX + exact_matches.index[0], KEY_COL_IDX]
        )

    # Extract references (the "reference" column) when the asset is found.
    references: list[str] = []
    if matched_row is not None:
        reference_col = _find_reference_col(df_raw.iloc[HEADER_ROW_IDX, :])
        ref_raw = matched_row.iloc[reference_col]
        if pd.notna(ref_raw) and str(ref_raw).strip():
            refs = re.split(r"[,\n\r]+", str(ref_raw))
            references = [r.strip() for r in refs if r.strip()]

    result: dict = {
        "asset_name_searched": args.asset_name,
        "asset_name_found": matched_name,
        "norm_key_searched": norm_target,
        "found": matched_row is not None,
        "file": str(file_path.resolve()),
        "references": references,
        "categories": {},
    }

    for category, (col_start, col_end) in CATEGORY_RANGES.items():
        raw_headers = df_raw.iloc[HEADER_ROW_IDX, col_start:col_end]
        col_names = [str(h).strip() for h in raw_headers]

        if matched_row is None:
            result["categories"][category] = {
                "label": CATEGORY_LABELS[category],
                "columns": col_names,
                "found": False,
                "values": {c: None for c in col_names},
            }
            continue

        values: dict[str, float | None] = {}
        for i, col_name in enumerate(col_names):
            raw_val = matched_row.iloc[col_start + i]
            try:
                values[col_name] = (
                    round(float(raw_val), 1) if pd.notna(raw_val) else 0.0
                )
            except (ValueError, TypeError):
                values[col_name] = 0.0

        result["categories"][category] = {
            "label": CATEGORY_LABELS[category],
            "columns": col_names,
            "found": True,
            "values": values,
        }

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
