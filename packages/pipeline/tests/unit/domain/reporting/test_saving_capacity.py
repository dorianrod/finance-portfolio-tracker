from datetime import date, datetime

import pandas as pd

from src.domain.models import Operation, OperationType, Position
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


def test_saving_capacity_snapshot_uses_net_flows_and_total_value_change():
    history = pd.DataFrame(
        {
            "snapshot_date": ["2024-01-31", "2024-02-29", "2024-03-31"],
            "total_value": [1000.0, 1600.0, 1700.0],
            "cash_delta": [None, 500.0, 0.0],
        }
    )

    df = saving_capacity_snapshot(history)

    # the first month has no prior month to diff against -> dropped
    assert df["snapshot_date"].tolist() == ["2024-02-29", "2024-03-31"]
    assert df["savings_delta"].tolist() == [500.0, 0.0]
    assert df["perf_delta"].tolist() == [100.0, 100.0]


def test_saving_capacity_snapshot_requires_cash_flow_history():
    history = pd.DataFrame(
        {"snapshot_date": ["2024-01-31"], "total_value": [1000.0]}
    )

    try:
        saving_capacity_snapshot(history)
    except ValueError as exc:
        assert "cash_delta" in str(exc)
    else:
        raise AssertionError("missing cash_delta should be rejected")


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
    df = saving_capacity_per_account([], [])

    assert df.empty
    assert list(df.columns) == [
        "snapshot_date",
        "account",
        "savings_delta",
        "perf_delta",
    ]


def _flow(
    account: str,
    operation_type: OperationType,
    amount: float,
    day: int = 15,
) -> Operation:
    return Operation(
        date=datetime(2024, 2, day),
        account=account,
        name="cash flow",
        operation_type=operation_type,
        total_amount=amount,
    )


def test_saving_capacity_per_account_uses_external_flows_only():
    positions = [
        _position("a", date(2024, 1, 31), 1000.0, 0.0),
        _position("a", date(2024, 2, 29), 1600.0, 100.0),
        _position("b", date(2024, 1, 31), 2000.0, 0.0),
        _position("b", date(2024, 2, 29), 2100.0, 10.0),
    ]
    operations = [
        _flow("a", OperationType.DEPOSIT, 500.0),
        _flow("a", OperationType.DIVIDEND, 900.0),
        _flow("b", OperationType.DEPOSIT, 150.0),
        _flow("b", OperationType.WITHDRAWAL, -100.0, day=20),
    ]

    df = saving_capacity_per_account(positions, operations)

    # the first month per account has nothing to diff against -> dropped
    assert set(df["snapshot_date"]) == {date(2024, 2, 29)}
    a_row = df[df["account"] == "a"].iloc[0]
    b_row = df[df["account"] == "b"].iloc[0]
    assert a_row["savings_delta"] == 500.0
    assert a_row["perf_delta"] == 100.0
    assert b_row["savings_delta"] == 50.0
    assert b_row["perf_delta"] == 50.0


def test_saving_capacity_per_account_includes_a_later_account_opening():
    positions = [
        _position("existing", date(2024, 1, 31), 1000.0, 0.0),
        _position("existing", date(2024, 2, 29), 1000.0, 0.0),
        _position("new", date(2024, 2, 29), 320.0, 20.0),
    ]

    df = saving_capacity_per_account(
        positions, [_flow("new", OperationType.DEPOSIT, 300.0)]
    )

    new_row = df[df["account"] == "new"].iloc[0]
    assert new_row["savings_delta"] == 300.0
    assert new_row["perf_delta"] == 20.0


def test_saving_capacity_per_account_keeps_a_closed_account_flow():
    positions = [
        _position("closed", date(2024, 1, 31), 1000.0, 0.0),
        _position("existing", date(2024, 1, 31), 2000.0, 0.0),
        _position("existing", date(2024, 2, 29), 2000.0, 0.0),
    ]

    df = saving_capacity_per_account(
        positions, [_flow("closed", OperationType.WITHDRAWAL, -1000.0)]
    )

    closed_row = df[
        (df["account"] == "closed")
        & (df["snapshot_date"] == date(2024, 2, 29))
    ].iloc[0]
    assert closed_row["savings_delta"] == -1000.0
    assert closed_row["perf_delta"] == 0.0
