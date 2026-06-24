from datetime import date, datetime
from pathlib import Path

import pandas as pd
import pytest

from src.domain.models import DEFAULT_TAX_RATE, Operation, OperationType
from src.infrastructure.parsers.direct import (
    DirectLoader,
    compute_positions,
    parse_operations,
)

_HEADER = (
    "date,account,isin,ticker,name,operation_type,quantity,"
    "price_per_unit,total_amount,currency\n"
)


def _row(
    date_: str,
    account: str,
    isin: str = "",
    ticker: str = "",
    name: str = "",
    operation_type: str = "DEPOSIT",
    quantity: str = "",
    price_per_unit: str = "",
    total_amount: str = "",
    currency: str = "",
) -> str:
    return ",".join(
        [
            date_,
            account,
            isin,
            ticker,
            name,
            operation_type,
            quantity,
            price_per_unit,
            total_amount,
            currency,
        ]
    )


def _write(tmp_path: Path, *rows: str) -> Path:
    path = tmp_path / "direct.csv"
    path.write_text(_HEADER + "\n".join(rows) + "\n", encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# parse_operations
# ---------------------------------------------------------------------------


def test_parse_operations_parses_a_cash_row_with_blank_optional_fields(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        _row(
            "2024-01-15",
            "livret_a",
            operation_type="DEPOSIT",
            total_amount="1000.0",
        ),
    )

    ops = parse_operations(path)

    assert len(ops) == 1
    op = ops[0]
    assert op.date == datetime(2024, 1, 15)
    assert op.account == "livret_a"
    assert op.isin is None
    assert op.ticker is None
    assert op.name is None
    assert op.operation_type == OperationType.DEPOSIT
    assert op.quantity is None
    assert op.price_per_unit is None
    assert op.total_amount == 1000.0
    assert op.currency == "EUR"  # blank -> defaults to EUR


def test_parse_operations_parses_a_unit_based_row(tmp_path: Path):
    path = _write(
        tmp_path,
        _row(
            "2024-02-01",
            "pe_fund",
            isin="FR1234567890",
            name="Private Fund",
            operation_type="BUY",
            quantity="10",
            price_per_unit="100.0",
            total_amount="-1000.0",
            currency="USD",
        ),
    )

    ops = parse_operations(path)

    op = ops[0]
    assert op.isin == "FR1234567890"
    assert op.name == "Private Fund"
    assert op.quantity == 10.0
    assert op.price_per_unit == 100.0
    assert op.currency == "USD"


def test_parse_operations_raises_on_missing_required_columns(tmp_path: Path):
    path = tmp_path / "bad.csv"
    path.write_text("date,account,total_amount\n2024-01-01,a,100.0\n")

    with pytest.raises(ValueError, match="missing columns"):
        parse_operations(path)


def test_parse_operations_collects_all_row_errors_before_raising(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        _row("not-a-date", "a", total_amount="100.0"),
        _row(
            "2024-01-01",
            "a",
            operation_type="UNKNOWN_TYPE",
            total_amount="100.0",
        ),
        _row("2024-01-02", "a", total_amount=""),
    )

    with pytest.raises(ValueError) as exc_info:
        parse_operations(path)

    message = str(exc_info.value)
    assert "line 2" in message and "invalid date" in message
    assert "line 3" in message and "unknown operation_type" in message
    assert "line 4" in message and "total_amount is required" in message


# ---------------------------------------------------------------------------
# compute_positions
# ---------------------------------------------------------------------------


def _op(account: str, op_type: OperationType, **kwargs) -> Operation:
    defaults: dict = {
        "date": date(2024, 1, 1),
        "account": account,
        "operation_type": op_type,
        "total_amount": 0.0,
    }
    defaults.update(kwargs)
    return Operation(**defaults)


def test_compute_positions_cash_based_running_balance_excludes_future_ops():
    ops = [
        _op(
            "livret_a",
            OperationType.DEPOSIT,
            date=date(2024, 1, 5),
            total_amount=1000.0,
            name="Livret A",
        ),
        _op(
            "livret_a",
            OperationType.INTEREST,
            date=date(2024, 1, 20),
            total_amount=2.0,
            name="Livret A",
        ),
        # after the snapshot date -> must not be counted
        _op(
            "livret_a",
            OperationType.DEPOSIT,
            date=date(2024, 3, 1),
            total_amount=500.0,
            name="Livret A",
        ),
    ]

    positions = compute_positions(ops, snapshot_dates=[date(2024, 1, 31)])

    assert len(positions) == 1
    pos = positions[0]
    assert pos.account == "livret_a"
    assert pos.total_value == 1002.0
    assert pos.avg_buy_price == 1002.0
    assert pos.tax_rate == 0.0
    assert pos.unrealized_gain == 0.0


def test_compute_positions_cash_based_skips_non_positive_balance():
    ops = [
        _op(
            "livret_a",
            OperationType.DEPOSIT,
            date=date(2024, 1, 5),
            total_amount=1000.0,
        ),
        _op(
            "livret_a",
            OperationType.WITHDRAWAL,
            date=date(2024, 1, 10),
            total_amount=-1000.0,
        ),
    ]

    positions = compute_positions(ops, snapshot_dates=[date(2024, 1, 31)])

    assert positions == []


def test_compute_positions_unit_based_falls_back_to_avg_buy_price():
    ops = [
        _op(
            "pe_fund",
            OperationType.BUY,
            date=date(2024, 1, 10),
            isin="FR1",
            name="Private Fund",
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
    ]

    positions = compute_positions(
        ops, asset_prices=pd.DataFrame(), snapshot_dates=[date(2024, 1, 31)]
    )

    assert len(positions) == 1
    pos = positions[0]
    assert pos.quantity == 10.0
    assert pos.last_price == pos.avg_buy_price == 100.0
    assert pos.tax_rate == DEFAULT_TAX_RATE


def test_compute_positions_unit_based_uses_price_lookup_by_ticker():
    ops = [
        _op(
            "pe_fund",
            OperationType.BUY,
            date=date(2024, 1, 10),
            ticker="PEFUND",
            name="Private Fund",
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
    ]
    asset_prices = pd.DataFrame(
        {
            "ticker": ["PEFUND"],
            "price": [120.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )

    positions = compute_positions(
        ops, asset_prices=asset_prices, snapshot_dates=[date(2024, 1, 31)]
    )

    assert positions[0].last_price == 120.0


def test_compute_positions_resolves_tax_rates_from_last_sell_and_dividend():
    ops = [
        _op(
            "pe_fund",
            OperationType.BUY,
            date=date(2024, 1, 10),
            isin="FR1",
            name="Private Fund",
            quantity=10.0,
            price_per_unit=100.0,
            total_amount=-1000.0,
        ),
        _op(
            "pe_fund",
            OperationType.SELL,
            date=date(2024, 1, 15),
            isin="FR1",
            name="Private Fund",
            quantity=2.0,
            price_per_unit=110.0,
            total_amount=220.0,
            tax_rate=0.17,
            realized_tax_rate=0.0,
        ),
        _op(
            "pe_fund",
            OperationType.DIVIDEND,
            date=date(2024, 1, 20),
            isin="FR1",
            name="Private Fund",
            total_amount=5.0,
            dividend_tax_rate=0.0,
        ),
    ]

    positions = compute_positions(
        ops, asset_prices=pd.DataFrame(), snapshot_dates=[date(2024, 1, 31)]
    )

    pos = positions[0]
    assert pos.tax_rate == 0.17
    assert pos.realized_tax_rate == 0.0
    assert pos.dividend_tax_rate == 0.0


# ---------------------------------------------------------------------------
# DirectLoader
# ---------------------------------------------------------------------------


def test_direct_loader_label_includes_filename(tmp_path: Path):
    path = _write(
        tmp_path, _row("2024-01-01", "a", total_amount="100.0")
    )
    loader = DirectLoader(filepath=path)

    assert loader.label == f"direct/{path.name}"


def test_direct_loader_groups_mixed_cash_and_unit_accounts_in_one_file(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        _row(
            "2024-01-05",
            "livret_a",
            operation_type="DEPOSIT",
            total_amount="1000.0",
            name="Livret A",
        ),
        _row(
            "2024-01-10",
            "pe_fund",
            isin="FR1",
            name="Private Fund",
            operation_type="BUY",
            quantity="10",
            price_per_unit="100.0",
            total_amount="-1000.0",
        ),
    )
    loader = DirectLoader(filepath=path)

    operations, positions = loader.load(
        ticker_map={}, asset_prices=pd.DataFrame()
    )

    assert len(operations) == 2
    assert {p.account for p in positions} == {"livret_a", "pe_fund"}
