from datetime import date, datetime

from src.domain.models import CashFlows, Operation, OperationType, Position
from src.domain.portfolio import (
    aggregate_positions,
    build_snapshot,
    cash_flow_analysis,
    gain_breakdown,
)


def _op(operation_type, total_amount, d=datetime(2024, 1, 15), **kwargs):
    return Operation(
        date=d,
        account="test",
        operation_type=operation_type,
        total_amount=total_amount,
        **kwargs,
    )


def _position(**kwargs):
    defaults = dict(
        snapshot_date=date(2024, 1, 31),
        account="test",
        name="Asset",
        quantity=10.0,
        avg_buy_price=100.0,
        last_price=110.0,
        total_value=1100.0,
        unrealized_gain=100.0,
        unrealized_gain_pct=10.0,
    )
    defaults.update(kwargs)
    return Position.model_validate(defaults)


def test_cash_flow_analysis_signs_and_totals():
    ops = [
        _op(OperationType.DEPOSIT, 1000.0),
        _op(OperationType.WITHDRAWAL, -200.0),
        _op(OperationType.DIVIDEND, 50.0),
        _op(OperationType.INTEREST, 5.0),
        _op(OperationType.BUY, -500.0),  # ignored by cash_flow_analysis
    ]
    flows = cash_flow_analysis(ops)
    assert flows.total_deposited == 1000.0
    assert flows.total_withdrawn == 200.0
    assert flows.net_cash_injected == 800.0
    assert flows.total_dividends == 50.0
    assert flows.total_interest == 5.0


def test_aggregate_positions_merges_same_isin_across_accounts():
    positions = [
        _position(
            account="acc1",
            isin="FR0000001",
            quantity=10.0,
            avg_buy_price=100.0,
            last_price=110.0,
            total_value=1100.0,
            realized_gain=20.0,
        ),
        _position(
            account="acc2",
            isin="FR0000001",
            quantity=5.0,
            avg_buy_price=120.0,
            last_price=110.0,
            total_value=550.0,
            realized_gain=0.0,
        ),
    ]
    [merged] = aggregate_positions(positions)

    total_cost = 10.0 * 100.0 + 5.0 * 120.0
    total_value = 1100.0 + 550.0

    assert merged.account == "all"
    assert merged.quantity == 15.0
    assert merged.avg_buy_price == round(total_cost / 15.0, 6)
    assert merged.total_value == round(total_value, 2)
    assert merged.unrealized_gain == round(total_value - total_cost, 2)
    assert merged.realized_gain == 20.0


def test_aggregate_positions_keeps_single_account_position_unchanged():
    pos = _position(isin="FR0000002")
    [result] = aggregate_positions([pos])
    assert result is pos


def test_gain_breakdown_computes_unrealized_gain_pct():
    positions = [
        _position(quantity=10.0, avg_buy_price=100.0, total_value=1100.0)
    ]
    cash_flows = CashFlows(
        total_deposited=1000.0,
        total_withdrawn=0.0,
        net_cash_injected=1000.0,
        total_dividends=0.0,
        total_interest=0.0,
    )
    breakdown = gain_breakdown(positions, cash_flows)
    assert breakdown["total_cost_basis"] == 1000.0
    assert breakdown["current_value"] == 1100.0
    assert breakdown["unrealized_gain"] == 100.0
    assert breakdown["unrealized_gain_pct"] == round(100.0 / 1000.0 * 100, 2)


def test_build_snapshot_aggregates_positions_and_cash_flows():
    positions = [
        _position(quantity=10.0, avg_buy_price=100.0, total_value=1100.0)
    ]
    ops = [_op(OperationType.DEPOSIT, 1000.0)]
    snapshot = build_snapshot(positions, ops, snapshot_date=date(2024, 6, 30))
    assert snapshot.snapshot_date == date(2024, 6, 30)
    assert snapshot.total_value == 1100.0
    assert snapshot.total_cost_basis == 1000.0
    assert snapshot.unrealized_gain == 100.0
    assert snapshot.cash_flows.net_cash_injected == 1000.0
