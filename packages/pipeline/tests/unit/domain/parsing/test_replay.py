from datetime import date, datetime

from src.domain.models import Operation, OperationType
from src.domain.parsing.replay import annotate_realized_gains, replay_holdings


def _isin_key(op: Operation) -> str:
    return op.isin or ""


def _trade_ops() -> list[Operation]:
    return [
        Operation(
            date=datetime(2024, 1, 10),
            account="a",
            isin="ISIN1",
            name="Asset A",
            operation_type=OperationType.BUY,
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
        Operation(
            date=datetime(2024, 2, 10),
            account="a",
            isin="ISIN1",
            operation_type=OperationType.SELL,
            quantity=4.0,
            price_per_unit=120.0,
            total_amount=480.0,
        ),
        Operation(
            date=datetime(2024, 3, 10),
            account="a",
            isin="ISIN1",
            operation_type=OperationType.BUY,
            quantity=5.0,
            price_per_unit=110.0,
            total_amount=-550.0,
        ),
    ]


def test_annotate_realized_gains_computes_proportional_cost_of_sold():
    ops = _trade_ops()
    annotate_realized_gains(ops, key_fn=_isin_key)

    sell = ops[1]
    # cost_of_sold = 1000 * (4/10) = 400 ; realized_gain = 480 - 400 = 80
    assert sell.realized_gain == 80.0


def test_replay_holdings_accumulates_up_to_snap_date():
    ops = _trade_ops()
    annotate_realized_gains(ops, key_fn=_isin_key)

    jan = replay_holdings(ops, date(2024, 1, 31), key_fn=_isin_key)
    assert jan["ISIN1"].quantity == 10.0
    assert jan["ISIN1"].total_cost == 1000.0
    assert jan["ISIN1"].realized_gain == 0.0
    assert jan["ISIN1"].name == "Asset A"

    feb = replay_holdings(ops, date(2024, 2, 28), key_fn=_isin_key)
    assert feb["ISIN1"].quantity == 6.0
    assert feb["ISIN1"].total_cost == 600.0
    assert feb["ISIN1"].realized_gain == 80.0

    mar = replay_holdings(ops, date(2024, 3, 31), key_fn=_isin_key)
    assert mar["ISIN1"].quantity == 11.0
    assert mar["ISIN1"].total_cost == 1150.0
    # name carried forward even though the last BUY has no name
    assert mar["ISIN1"].name == "Asset A"


def test_replay_holdings_keys_independently_per_key_fn():
    ops = [
        Operation(
            date=datetime(2024, 1, 1),
            account="a",
            isin="ISIN1",
            operation_type=OperationType.BUY,
            quantity=1.0,
            price_per_unit=10.0,
            total_amount=-10.0,
        ),
        Operation(
            date=datetime(2024, 1, 2),
            account="a",
            isin="ISIN2",
            operation_type=OperationType.BUY,
            quantity=2.0,
            price_per_unit=20.0,
            total_amount=-40.0,
        ),
    ]
    annotate_realized_gains(ops, key_fn=_isin_key)
    holdings = replay_holdings(
        ops, date(2024, 12, 31), key_fn=_isin_key
    )

    assert set(holdings) == {"ISIN1", "ISIN2"}
    assert holdings["ISIN1"].quantity == 1.0
    assert holdings["ISIN2"].quantity == 2.0
