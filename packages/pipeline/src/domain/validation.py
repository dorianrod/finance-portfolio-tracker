"""Coherence checks on positions and operations DataFrames."""

import pandas as pd


def check_positions(
    positions_df: pd.DataFrame,
    operations_df: pd.DataFrame,
) -> list[tuple[str, pd.DataFrame | None]]:
    """Run coherence checks and return a list of (warning_message,
    detail_df) tuples.

    Returns an empty list when no issues are found.

    Checks performed:
      - Negative quantities in any snapshot
      - Positions with zero value in the most recent snapshot
      - Duplicate rows (same snapshot_date / account / isin / ticker)
      - BUY/SELL operations missing both ISIN and ticker
    """
    issues: list[tuple[str, pd.DataFrame | None]] = []

    neg_qty = positions_df[positions_df["quantity"] < 0]
    if not neg_qty.empty:
        issues.append(
            (f"⚠️  {len(neg_qty)} rows with negative quantity", neg_qty)
        )

    latest_date = positions_df["snapshot_date"].max()
    latest = positions_df[positions_df["snapshot_date"] == latest_date]
    zero_val = latest[latest["total_value"] == 0]
    if not zero_val.empty:
        issues.append(
            (
                f"⚠️  {len(zero_val)} positions at €0 in the latest snapshot",
                zero_val[
                    [
                        "account",
                        "isin",
                        "ticker",
                        "name",
                        "quantity",
                        "total_value",
                    ]
                ],
            )
        )

    dups = positions_df[
        positions_df.duplicated(
            ["snapshot_date", "account", "isin", "ticker"], keep=False
        )
    ]
    if not dups.empty:
        issues.append(
            (
                f"⚠️  {len(dups)} duplicate rows (same date/account/isin)",
                dups.head(10),
            )
        )

    no_id = operations_df[
        operations_df["operation_type"].isin(["BUY", "SELL"])
        & operations_df["isin"].isna()
        & operations_df["ticker"].isna()
    ]
    if not no_id.empty:
        issues.append(
            (
                f"⚠️  {len(no_id)} BUY/SELL operations without ISIN or ticker",
                no_id[
                    [
                        "date",
                        "account",
                        "operation_type",
                        "quantity",
                        "total_amount",
                    ]
                ],
            )
        )

    return issues
