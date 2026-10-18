#!/usr/bin/env python3
"""Validate a manual/agent fund snapshot with the pipeline's exact rules."""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4]))

from src.fund_holdings_snapshots import validate_snapshot_dir  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("snapshot_dir", type=Path)
    parser.add_argument(
        "--today", type=date.fromisoformat, default=date.today()
    )
    args = parser.parse_args()
    snapshot = validate_snapshot_dir(args.snapshot_dir, today=args.today)
    print(
        f"valid: {snapshot.snapshot_id} | {len(snapshot.holdings)} rows | "
        f"{snapshot.coverage_pct:.2f}% | sha256={snapshot.checksum_sha256}"
    )


if __name__ == "__main__":
    main()
