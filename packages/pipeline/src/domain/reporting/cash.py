"""Cash position snapshot by month and account.

cash_snapshot() computes data/output/cash.csv's columns from already-parsed
operations: snapshot_date, account, deposits, withdrawals, buy_cost,
sell_proceeds, dividends, interest, cumulative_cash. Reading the input
files and writing the CSV are the caller's responsibility.
"""

import pandas as pd

from src.domain.models import Operation, OperationType
from src.domain.utils import month_end_dates


def cash_snapshot(operations: list[Operation]) -> pd.DataFrame:
    """Return a DataFrame with monthly cash positions per account."""
    if not operations:
        return pd.DataFrame()

    accounts = sorted(set(op.account for op in operations))

    rows = []
    for account in accounts:
        acc_ops = [op for op in operations if op.account == account]

        for snap_date in month_end_dates(acc_ops):
            period_ops = [op for op in acc_ops if op.date.date() <= snap_date]

            deposits = sum(
                op.total_amount
                for op in period_ops
                if op.operation_type == OperationType.DEPOSIT
            )
            withdrawals = sum(
                abs(op.total_amount)
                for op in period_ops
                if op.operation_type == OperationType.WITHDRAWAL
            )
            buy_cost = sum(
                abs(op.total_amount)
                for op in period_ops
                if op.operation_type == OperationType.BUY
            )
            sell_proceeds = sum(
                op.total_amount
                for op in period_ops
                if op.operation_type == OperationType.SELL
            )
            dividends = sum(
                op.total_amount
                for op in period_ops
                if op.operation_type == OperationType.DIVIDEND
            )
            interest = sum(
                op.total_amount
                for op in period_ops
                if op.operation_type == OperationType.INTEREST
            )

            if sell_proceeds < 0:
                sell_proceeds = abs(sell_proceeds)

            cumulative_cash = (
                deposits
                - withdrawals
                - buy_cost
                + sell_proceeds
                + dividends
                + interest
            )

            rows.append(
                {
                    "snapshot_date": snap_date.isoformat(),
                    "account": account,
                    "deposits": round(deposits, 2),
                    "withdrawals": round(withdrawals, 2),
                    "buy_cost": round(buy_cost, 2),
                    "sell_proceeds": round(sell_proceeds, 2),
                    "dividends": round(dividends, 2),
                    "interest": round(interest, 2),
                    "cumulative_cash": round(cumulative_cash, 2),
                }
            )

    return (
        pd.DataFrame(rows)
        .sort_values(["snapshot_date", "account"])
        .reset_index(drop=True)
    )
