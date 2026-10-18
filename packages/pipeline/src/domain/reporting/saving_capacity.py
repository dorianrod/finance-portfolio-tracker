"""Monthly net contributions and investment performance.

Savings are external cash flows into the tracked portfolio (deposits minus
withdrawals), not changes in cost basis. Cost basis also moves when gains or
income are reinvested and therefore cannot measure fresh savings.

Columns
-------
  snapshot_date   : month-end date (YYYY-MM-DD or partial for current month)
  savings_delta   : net external contributions during the month (€)
  perf_delta      : portfolio value change excluding those contributions (€)
"""

import pandas as pd

from src.domain.models import Operation, OperationType, Position

_OUTPUT_COLUMNS = ["snapshot_date", "savings_delta", "perf_delta"]
_ACCOUNT_OUTPUT_COLUMNS = ["snapshot_date", "account", *_OUTPUT_COLUMNS[1:]]


def saving_capacity_snapshot(
    portfolio_history: pd.DataFrame,
) -> pd.DataFrame:
    """Return monthly net contributions and total investment performance.

    ``portfolio_history`` is produced by ``portfolio_history_snapshot`` and
    contains the cumulative external cash invested as well as portfolio value.
    The first row is omitted because no prior portfolio value exists against
    which its performance can be measured.
    """
    if portfolio_history.empty:
        return pd.DataFrame(columns=_OUTPUT_COLUMNS)

    required = {"snapshot_date", "total_value", "cash_delta"}
    missing = required.difference(portfolio_history.columns)
    if missing:
        raise ValueError(
            "portfolio_history is missing required columns: "
            + ", ".join(sorted(missing))
        )

    df = (
        portfolio_history[list(required)]
        .copy()
        .sort_values("snapshot_date")
        .reset_index(drop=True)
    )
    value_delta = pd.to_numeric(df["total_value"], errors="coerce").diff()
    df["savings_delta"] = pd.to_numeric(
        df["cash_delta"], errors="coerce"
    ).round(2)
    df["perf_delta"] = (value_delta - df["savings_delta"]).round(2)

    return df[_OUTPUT_COLUMNS].dropna().reset_index(drop=True)


def saving_capacity_per_account(
    positions: list[Position], operations: list[Operation]
) -> pd.DataFrame:
    """Return monthly net contributions and performance for each account.

    Account contributions use only DEPOSIT/WITHDRAWAL operations. A BUY,
    SELL, dividend, interest payment or reinvestment therefore affects
    performance or allocation, never fresh savings.
    """
    if not positions:
        return pd.DataFrame(columns=_ACCOUNT_OUTPUT_COLUMNS)

    pos_df = pd.DataFrame(
        [
            {
                "snapshot_date": p.snapshot_date,
                "account": p.account,
                "total_value": p.total_value,
            }
            for p in positions
        ]
    )
    position_values = (
        pos_df.groupby(["account", "snapshot_date"])
        .agg(total_value=("total_value", "sum"))
        .reset_index()
    )

    external_flows = [
        [
            pd.to_datetime(op.date),
            op.account,
            (
                float(op.total_amount)
                if op.operation_type == OperationType.DEPOSIT
                else -abs(float(op.total_amount))
            ),
        ]
        for op in operations
        if op.operation_type
        in (OperationType.DEPOSIT, OperationType.WITHDRAWAL)
    ]
    flows = pd.DataFrame(
        external_flows, columns=["date", "account", "amount"]
    )

    snapshot_dates = sorted(pos_df["snapshot_date"].unique())
    accounts = sorted(
        set(pos_df["account"].astype(str))
        | set(flows["account"].astype(str))
    )
    monthly = (
        pd.MultiIndex.from_product(
            [accounts, snapshot_dates],
            names=["account", "snapshot_date"],
        )
        .to_frame(index=False)
        .merge(
            position_values,
            on=["account", "snapshot_date"],
            how="left",
        )
        .fillna({"total_value": 0.0})
        .sort_values(["account", "snapshot_date"])
    )
    previous_by_date = {
        snapshot_date: (
            snapshot_dates[index - 1] if index > 0 else None
        )
        for index, snapshot_date in enumerate(snapshot_dates)
    }

    def period_flow(account: str, snapshot_date: object) -> float:
        previous_date = previous_by_date[snapshot_date]
        if previous_date is None:
            return float("nan")
        if flows.empty:
            return 0.0
        previous = pd.to_datetime(str(previous_date))
        current = pd.to_datetime(str(snapshot_date))
        matching = flows[
            (flows["account"] == account)
            & (flows["date"] > previous)
            & (flows["date"] <= current)
        ]
        return float(matching["amount"].sum())

    monthly["savings_delta"] = [
        period_flow(str(row.account), row.snapshot_date)
        for row in monthly.itertuples(index=False)
    ]
    grouped = monthly.groupby("account", sort=False)
    value_delta = grouped["total_value"].diff()

    monthly["savings_delta"] = monthly["savings_delta"].round(2)
    monthly["perf_delta"] = (
        value_delta - monthly["savings_delta"]
    ).round(2)

    return (
        monthly[_ACCOUNT_OUTPUT_COLUMNS]
        .dropna()
        .reset_index(drop=True)
    )
