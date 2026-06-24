"""cash_snapshot derives one snapshot row per (account, calendar month).

Operations are pinned to today's date in most tests so that month_end_dates
(which always projects through the current month, see
src/domain/utils.py) yields exactly one snapshot per account, keeping
assertions independent of when the suite runs.
"""

from datetime import date, datetime

import pytest

from src.domain.models import Operation, OperationType
from src.domain.reporting.cash import cash_snapshot

_TODAY = date.today()


def _op(account: str, op_type: OperationType, amount: float) -> Operation:
    return Operation(
        date=datetime.combine(_TODAY, datetime.min.time()),
        account=account,
        operation_type=op_type,
        total_amount=amount,
    )


def test_cash_snapshot_empty_operations_returns_empty_dataframe():
    assert cash_snapshot([]).empty


def test_cash_snapshot_computes_cumulative_cash_for_single_account():
    ops = [
        _op("a", OperationType.DEPOSIT, 1000.0),
        _op("a", OperationType.BUY, -400.0),
        _op("a", OperationType.DIVIDEND, 10.0),
        _op("a", OperationType.INTEREST, 2.0),
    ]

    df = cash_snapshot(ops)

    assert len(df) == 1
    row = df.iloc[0]
    assert row["snapshot_date"] == _TODAY.isoformat()
    assert row["account"] == "a"
    assert row["deposits"] == 1000.0
    assert row["buy_cost"] == 400.0
    assert row["dividends"] == 10.0
    assert row["interest"] == 2.0
    assert row["withdrawals"] == 0.0
    assert row["sell_proceeds"] == 0.0
    assert row["cumulative_cash"] == pytest.approx(612.0)


def test_cash_snapshot_normalizes_sell_proceeds_sign():
    # SELL recorded with a negative amount, as some broker exports do
    ops = [
        _op("a", OperationType.DEPOSIT, 1000.0),
        _op("a", OperationType.BUY, -1000.0),
        _op("a", OperationType.SELL, -300.0),
    ]

    df = cash_snapshot(ops)

    row = df.iloc[0]
    assert row["sell_proceeds"] == 300.0
    assert row["cumulative_cash"] == pytest.approx(300.0)


def test_cash_snapshot_withdrawals_use_absolute_value():
    ops = [
        _op("a", OperationType.DEPOSIT, 1000.0),
        _op("a", OperationType.WITHDRAWAL, -200.0),
    ]

    df = cash_snapshot(ops)

    row = df.iloc[0]
    assert row["withdrawals"] == 200.0
    assert row["cumulative_cash"] == pytest.approx(800.0)


def test_cash_snapshot_separates_and_sorts_rows_by_account():
    ops = [
        _op("b", OperationType.DEPOSIT, 500.0),
        _op("a", OperationType.DEPOSIT, 1000.0),
    ]

    df = cash_snapshot(ops)

    assert df["account"].tolist() == ["a", "b"]
