"""Monthly portfolio history snapshot.

One row per month-end date, all accounts aggregated:
  snapshot_date, total_value, total_cost_basis, unrealized_gain,
  net_cash_injected, cash_delta
"""

import pandas as pd

from src.domain.models import Operation, OperationType, Position
from src.domain.tri import monthly_tri_series


def portfolio_history_snapshot(
    positions: list[Position],
    operations: list[Operation],
) -> pd.DataFrame:
    if not positions:
        return pd.DataFrame()

    pos_rows = [
        {
            "snapshot_date": p.snapshot_date,
            "total_value": p.total_value,
            "total_cost": p.quantity * p.avg_buy_price,
        }
        for p in positions
    ]
    pos_df = pd.DataFrame(pos_rows)

    monthly = (
        pos_df.groupby("snapshot_date")
        .agg(
            total_value=("total_value", "sum"),
            total_cost_basis=("total_cost", "sum"),
        )
        .reset_index()
        .sort_values("snapshot_date")
    )
    monthly["unrealized_gain"] = (
        monthly["total_value"] - monthly["total_cost_basis"]
    ).round(2)
    monthly["total_value"] = monthly["total_value"].round(2)
    monthly["total_cost_basis"] = monthly["total_cost_basis"].round(2)

    ops_df = pd.DataFrame(
        [
            {
                "date": pd.to_datetime(op.date),
                "operation_type": op.operation_type,
                "total_amount": op.total_amount,
            }
            for op in operations
        ]
    )

    cash_rows = []
    for snap_date in sorted(monthly["snapshot_date"].unique()):
        snap_dt = pd.to_datetime(snap_date)
        period = ops_df[ops_df["date"] <= snap_dt]

        deposited = period[period["operation_type"] == OperationType.DEPOSIT][
            "total_amount"
        ].sum()
        withdrawn = (
            period[period["operation_type"] == OperationType.WITHDRAWAL][
                "total_amount"
            ]
            .abs()
            .sum()
        )
        cash_rows.append(
            {
                "snapshot_date": snap_date,
                "net_cash_injected": round(float(deposited - withdrawn), 2),
            }
        )

    cash_df = pd.DataFrame(cash_rows)
    monthly = monthly.merge(cash_df, on="snapshot_date", how="left")
    monthly["cash_delta"] = monthly["net_cash_injected"].diff().round(2)

    tri_by_date = monthly_tri_series(positions, operations)
    monthly["tri"] = monthly["snapshot_date"].map(tri_by_date)

    return monthly.reset_index(drop=True)
