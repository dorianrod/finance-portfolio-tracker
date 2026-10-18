#!/usr/bin/env python3
"""Print unresolved composite positions ordered by monetary impact."""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", required=True, type=Path)
    args = parser.parse_args()
    path = args.data_dir / "output" / "fund_unresolved.csv"
    if not path.exists():
        raise SystemExit(f"missing {path}; run finance-fund-holdings first")
    frame = pd.read_csv(path).fillna("")
    if frame.empty:
        print("No unresolved fund exposure.")
        return
    frame["market_value"] = pd.to_numeric(
        frame["market_value"], errors="coerce"
    ).fillna(0)
    columns = [
        "parent_id",
        "parent_name",
        "unresolved_id",
        "unresolved_name",
        "reason",
        "market_value",
        "path",
    ]
    print(
        frame.sort_values("market_value", ascending=False)[columns].to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()
