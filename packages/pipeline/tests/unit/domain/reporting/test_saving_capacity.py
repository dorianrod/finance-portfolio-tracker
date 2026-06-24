from datetime import date

import pandas as pd

from src.domain.models import Position
from src.domain.reporting.saving_capacity import (
    saving_capacity_per_account,
    saving_capacity_snapshot,
)


def test_saving_capacity_snapshot_empty_returns_empty_with_columns():
    df = saving_capacity_snapshot(pd.DataFrame())

    assert df.empty
    assert list(df.columns) == [
        "snapshot_date",
        "savings_delta",
        "perf_delta",
    ]


def test_saving_capacity_snapshot_computes_month_over_month_deltas():
    history = pd.DataFrame(
        {
            "snapshot_date": ["2024-01-31", "2024-02-29", "2024-03-31"],
            "total_cost_basis": [1000.0, 1500.0, 1500.0],
            "unrealized_gain": [0.0, 50.0, 20.0],
        }
    )

    df = saving_capacity_snapshot(history)

    # the first month has no prior month to diff against -> dropped
    assert df["snapshot_date"].tolist() == ["2024-02-29", "2024-03-31"]
    assert df["savings_delta"].tolist() == [500.0, 0.0]
    assert df["perf_delta"].tolist() == [50.0, -30.0]


def _position(
    account: str,
    snap_date: date,
    total_value: float,
    unrealized_gain: float,
) -> Position:
    return Position(
        snapshot_date=snap_date,
        account=account,
        name="x",
        quantity=total_value,
        avg_buy_price=1.0,
        last_price=1.0,
        total_value=total_value,
        unrealized_gain=unrealized_gain,
        unrealized_gain_pct=0.0,
    )


def test_saving_capacity_per_account_empty_returns_empty_with_columns():
    df = saving_capacity_per_account([])

    assert df.empty
    assert list(df.columns) == [
        "snapshot_date",
        "account",
        "savings_delta",
        "perf_delta",
    ]


def test_saving_capacity_per_account_diffs_independently_per_account():
    positions = [
        _position("a", date(2024, 1, 31), 1000.0, 0.0),
        _position("a", date(2024, 2, 29), 1500.0, 50.0),
        _position("b", date(2024, 1, 31), 2000.0, 0.0),
        _position("b", date(2024, 2, 29), 2100.0, 10.0),
    ]

    df = saving_capacity_per_account(positions)

    # the first month per account has nothing to diff against -> dropped
    assert set(df["snapshot_date"]) == {date(2024, 2, 29)}
    a_row = df[df["account"] == "a"].iloc[0]
    b_row = df[df["account"] == "b"].iloc[0]
    assert a_row["savings_delta"] == 500.0
    assert a_row["perf_delta"] == 50.0
    assert b_row["savings_delta"] == 100.0
    assert b_row["perf_delta"] == 10.0
