from datetime import date, datetime, timedelta

import pytest

from src.domain.models import Operation, OperationType, Position
from src.domain.tri import (
    _xirr,
    monthly_tri_series,
    portfolio_xirr,
    rolling_tri_series,
)


def test_xirr_known_case_roughly_ten_percent():
    # -1000 today, +1100 exactly one year later => XIRR ~= 10%
    flows = [(-1000.0, date(2023, 1, 1)), (1100.0, date(2024, 1, 1))]
    rate = _xirr(flows)
    assert rate is not None
    assert abs(rate - 0.10) < 0.005


def test_xirr_returns_none_for_single_flow_or_same_sign():
    assert _xirr([(100.0, date(2023, 1, 1))]) is None
    assert _xirr([(100.0, date(2023, 1, 1)), (50.0, date(2023, 6, 1))]) is None


def test_portfolio_xirr_uses_only_deposits_and_withdrawals():
    ops = [
        Operation(
            date=datetime(2023, 1, 1),
            account="a",
            operation_type=OperationType.DEPOSIT,
            total_amount=1000.0,
        ),
        Operation(
            date=datetime(2023, 6, 1),
            account="a",
            operation_type=OperationType.DIVIDEND,
            total_amount=20.0,
        ),
    ]
    rate = portfolio_xirr(
        ops, terminal_value=1100.0, terminal_date=date(2024, 1, 1)
    )
    assert rate is not None
    assert abs(rate - 0.10) < 0.005


def test_portfolio_xirr_returns_none_without_external_flows():
    ops = [
        Operation(
            date=datetime(2023, 1, 1),
            account="a",
            operation_type=OperationType.DIVIDEND,
            total_amount=20.0,
        ),
    ]
    assert (
        portfolio_xirr(
            ops, terminal_value=1000.0, terminal_date=date(2024, 1, 1)
        )
        is None
    )


def test_monthly_tri_series_returns_one_value_per_snapshot():
    positions = [
        Position(
            snapshot_date=date(2023, 1, 31),
            account="a",
            name="cash",
            quantity=1000.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1000.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
        Position(
            snapshot_date=date(2023, 12, 31),
            account="a",
            name="cash",
            quantity=1100.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1100.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
    ]
    ops = [
        Operation(
            date=datetime(2023, 1, 1),
            account="a",
            operation_type=OperationType.DEPOSIT,
            total_amount=1000.0,
        ),
    ]
    result = monthly_tri_series(positions, ops)
    assert set(result.keys()) == {date(2023, 1, 31), date(2023, 12, 31)}


def test_rolling_tri_series_returns_none_before_window_matures():
    positions = [
        Position(
            snapshot_date=date(2022, 1, 31),
            account="a",
            name="cash",
            quantity=1000.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1000.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
    ]
    ops = [
        Operation(
            date=datetime(2022, 1, 1),
            account="a",
            operation_type=OperationType.DEPOSIT,
            total_amount=1000.0,
        ),
    ]
    result = rolling_tri_series(positions, ops, window_years=1.0)
    assert result[date(2022, 1, 31)] is None


def test_rolling_tri_series_uses_window_start_value_as_synthetic_outflow():
    # Deposit on day 0, portfolio snapshot at window start (exactly one year
    # before a later snapshot) and at that later snapshot. The window-start
    # value stands in for the deposit, so only the one-year span (1000 ->
    # 1200) should drive the trailing rate, ignoring the deposit itself
    # which sits before the window.
    positions = [
        Position(
            snapshot_date=date(2022, 1, 31),
            account="a",
            name="cash",
            quantity=1000.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1000.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
        Position(
            snapshot_date=date(2023, 1, 31),
            account="a",
            name="cash",
            quantity=1200.0,
            avg_buy_price=1.0,
            last_price=1.0,
            total_value=1200.0,
            unrealized_gain=0.0,
            unrealized_gain_pct=0.0,
        ),
    ]
    ops = [
        Operation(
            date=datetime(2022, 1, 1),
            account="a",
            operation_type=OperationType.DEPOSIT,
            total_amount=1000.0,
        ),
    ]
    assert date(2023, 1, 31) - date(2022, 1, 31) == timedelta(days=365)

    result = rolling_tri_series(positions, ops, window_years=1.0)
    assert result[date(2022, 1, 31)] is None
    assert result[date(2023, 1, 31)] == pytest.approx(20.0, abs=0.5)
