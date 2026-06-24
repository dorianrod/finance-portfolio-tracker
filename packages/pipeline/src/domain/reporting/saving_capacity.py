"""Monthly savings capacity snapshot.

Logic
-----
For each month, "capital deployed" = positions cost basis (which now includes
uninvested broker cash as synthetic cash positions added by the
ingestion pipeline, src/ingest_portfolio.py).

Columns
-------
  snapshot_date   : month-end date (YYYY-MM-DD or partial for current month)
  savings_delta   : month-over-month change in capital deployed (€)
  perf_delta      : month-over-month change in unrealized market gain (€)
"""

import pandas as pd

from src.domain.models import Position


def saving_capacity_snapshot(
    portfolio_history: pd.DataFrame,
) -> pd.DataFrame:
    """Return a DataFrame with monthly savings capacity metrics.

    Parameters
    ----------
    portfolio_history : output of portfolio_history_snapshot()
        Must contain columns: snapshot_date, total_cost_basis, unrealized_gain
    """
    if portfolio_history.empty:
        return pd.DataFrame(
            columns=["snapshot_date", "savings_delta", "perf_delta"]
        )

    df = (
        portfolio_history[
            ["snapshot_date", "total_cost_basis", "unrealized_gain"]
        ]
        .copy()
        .sort_values("snapshot_date")
        .reset_index(drop=True)
    )

    df["savings_delta"] = df["total_cost_basis"].diff().round(2)
    df["perf_delta"] = df["unrealized_gain"].diff().round(2)

    return (
        df[["snapshot_date", "savings_delta", "perf_delta"]]
        .dropna()
        .reset_index(drop=True)
    )


def saving_capacity_per_account(positions: list[Position]) -> pd.DataFrame:
    """Return per-account monthly savings capacity metrics."""
    if not positions:
        return pd.DataFrame(
            columns=["snapshot_date", "account", "savings_delta", "perf_delta"]
        )

    pos_df = pd.DataFrame(
        [
            {
                "snapshot_date": p.snapshot_date,
                "account": p.account,
                "total_cost": p.quantity * p.avg_buy_price,
                "unrealized_gain": p.unrealized_gain,
            }
            for p in positions
        ]
    )

    monthly = (
        pos_df.groupby(["account", "snapshot_date"])
        .agg(
            total_cost_basis=("total_cost", "sum"),
            unrealized_gain=("unrealized_gain", "sum"),
        )
        .reset_index()
        .sort_values(["account", "snapshot_date"])
    )

    monthly["savings_delta"] = (
        monthly.groupby("account")["total_cost_basis"].diff().round(2)
    )
    monthly["perf_delta"] = (
        monthly.groupby("account")["unrealized_gain"].diff().round(2)
    )

    return (
        monthly[["snapshot_date", "account", "savings_delta", "perf_delta"]]
        .dropna()
        .reset_index(drop=True)
    )
