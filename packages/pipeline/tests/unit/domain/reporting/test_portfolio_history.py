from datetime import date, datetime

import pandas as pd
import pytest

from src.domain.models import Operation, OperationType, Position
from src.domain.reporting.portfolio_history import portfolio_history_snapshot


def _position(
    account: str,
    snap_date: date,
    total_value: float,
    cost_per_unit: float = 1.0,
) -> Position:
    quantity = total_value / cost_per_unit
    return Position(
        snapshot_date=snap_date,
        account=account,
        name="cash",
        quantity=quantity,
        avg_buy_price=cost_per_unit,
        last_price=cost_per_unit,
        total_value=total_value,
        unrealized_gain=0.0,
        unrealized_gain_pct=0.0,
    )


def _deposit(account: str, d: date, amount: float) -> Operation:
    return Operation(
        date=datetime.combine(d, datetime.min.time()),
        account=account,
        operation_type=OperationType.DEPOSIT,
        total_amount=amount,
    )


def test_portfolio_history_snapshot_empty_positions_returns_empty_dataframe():
    assert portfolio_history_snapshot([], []).empty


def test_portfolio_history_snapshot_aggregates_across_accounts_per_month():
    positions = [
        _position("a", date(2024, 1, 31), 1000.0),
        _position("b", date(2024, 1, 31), 500.0),
        _position("a", date(2024, 2, 29), 1100.0),
        _position("b", date(2024, 2, 29), 600.0),
    ]
    operations = [_deposit("a", date(2024, 1, 1), 1500.0)]

    df = portfolio_history_snapshot(positions, operations)

    assert df["snapshot_date"].tolist() == [
        date(2024, 1, 31),
        date(2024, 2, 29),
    ]
    assert df["total_value"].tolist() == [1500.0, 1700.0]
    assert df["total_cost_basis"].tolist() == [1500.0, 1700.0]
    assert df["unrealized_gain"].tolist() == [0.0, 0.0]


def test_portfolio_history_snapshot_computes_net_cash_injected_and_delta():
    positions = [
        _position("a", date(2024, 1, 31), 1000.0),
        _position("a", date(2024, 2, 29), 1500.0),
    ]
    operations = [
        _deposit("a", date(2024, 1, 1), 1000.0),
        _deposit("a", date(2024, 2, 1), 500.0),
    ]

    df = portfolio_history_snapshot(positions, operations)

    assert df["net_cash_injected"].tolist() == [1000.0, 1500.0]
    assert pd.isna(df["cash_delta"].iloc[0])
    assert df["cash_delta"].iloc[1] == 500.0


def test_portfolio_history_snapshot_includes_tri_column():
    positions = [
        _position("a", date(2023, 1, 31), 1000.0),
        _position("a", date(2023, 12, 31), 1100.0),
    ]
    operations = [_deposit("a", date(2023, 1, 1), 1000.0)]

    df = portfolio_history_snapshot(positions, operations)

    assert "tri" in df.columns
    # ~10% over ~1 year, matching the known XIRR case in test_tri.py
    assert df["tri"].iloc[1] == pytest.approx(10.0, abs=0.5)
