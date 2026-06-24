"""Tests for the valuations.py parser.

Dates are anchored relative to date.today() (mirroring the pattern used
for cash_snapshot, see tests/unit/domain/reporting/test_cash.py): parse()
fills positions forward from the first valuation date through today (see
_month_end_dates), so anchoring keeps assertions independent of when the
suite runs.
"""

from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import pytest

from src.domain.models import OperationType
from src.infrastructure.parsers.valuations import ValuationsLoader, parse

_TODAY = date.today()
_PREV_MONTH_END = date(_TODAY.year, _TODAY.month, 1) - timedelta(days=1)

_HEADER = "date,account,isin,ticker,name,value,invested,currency,tax_rate\n"


def _row(
    date_: str,
    account: str,
    name: str,
    value: str,
    invested: str = "",
    isin: str = "",
    ticker: str = "",
    currency: str = "",
    tax_rate: str = "",
) -> str:
    return ",".join(
        [
            date_,
            account,
            isin,
            ticker,
            name,
            value,
            invested,
            currency,
            tax_rate,
        ]
    )


def _write(tmp_path: Path, *rows: str) -> Path:
    path = tmp_path / "valuations.csv"
    path.write_text(_HEADER + "\n".join(rows) + "\n", encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# parse
# ---------------------------------------------------------------------------


def test_parse_single_row_defaults_invested_to_value(tmp_path: Path):
    path = _write(
        tmp_path, _row(_TODAY.isoformat(), "pe_fund", "Private Fund", "1000.0")
    )

    operations, positions = parse(path)

    assert len(operations) == 1
    op = operations[0]
    assert op.operation_type == OperationType.BUY
    assert op.quantity == 1000.0
    assert op.total_amount == -1000.0

    assert len(positions) == 1
    pos = positions[0]
    assert pos.snapshot_date == _TODAY
    assert pos.total_value == 1000.0
    assert pos.avg_buy_price == 1000.0
    assert pos.unrealized_gain == 0.0


def test_parse_generates_buy_for_capital_increase_and_tracks_gain(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        _row(
            _PREV_MONTH_END.isoformat(),
            "pe_fund",
            "Private Fund",
            "1000.0",
            invested="1000.0",
        ),
        _row(
            _TODAY.isoformat(),
            "pe_fund",
            "Private Fund",
            "1300.0",
            invested="1200.0",
        ),
    )

    operations, positions = parse(path)

    assert [op.operation_type for op in operations] == [
        OperationType.BUY,
        OperationType.BUY,
    ]
    assert operations[0].total_amount == -1000.0
    assert operations[1].total_amount == -200.0  # delta = 1200 - 1000

    assert len(positions) == 2
    last = positions[-1]
    assert last.snapshot_date == _TODAY
    assert last.total_value == 1300.0
    assert last.avg_buy_price == 1200.0
    assert last.unrealized_gain == 100.0


def test_parse_generates_sell_for_capital_decrease_with_proportional_proceeds(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        _row(
            _PREV_MONTH_END.isoformat(),
            "pe_fund",
            "Private Fund",
            "1000.0",
            invested="1000.0",
        ),
        _row(
            _TODAY.isoformat(),
            "pe_fund",
            "Private Fund",
            "300.0",
            invested="500.0",
        ),
    )

    operations, _ = parse(path)

    sell = operations[1]
    assert sell.operation_type == OperationType.SELL
    assert sell.quantity == 500.0  # |500 - 1000|
    # proceeds = prev_value * (|delta| / prev_invested) = 1000 * 0.5
    assert sell.total_amount == 500.0


def test_parse_fills_forward_value_and_invested_across_gap_months(
    tmp_path: Path,
):
    start = date(_TODAY.year, _TODAY.month, 1) - timedelta(days=95)
    path = _write(
        tmp_path,
        _row(start.isoformat(), "pe_fund", "Private Fund", "1000.0"),
    )

    _, positions = parse(path)

    assert len(positions) >= 2  # at least the start month and today
    assert all(p.total_value == 1000.0 for p in positions)
    assert all(p.avg_buy_price == 1000.0 for p in positions)
    assert positions[-1].snapshot_date == _TODAY


def test_parse_skips_snapshot_when_current_value_is_zero(tmp_path: Path):
    start = date(_TODAY.year, _TODAY.month, 1) - timedelta(days=95)
    path = _write(
        tmp_path,
        _row(start.isoformat(), "pe_fund", "Private Fund", "1000.0"),
        _row(_TODAY.isoformat(), "pe_fund", "Private Fund", "0"),
    )

    _, positions = parse(path)

    assert all(p.snapshot_date != _TODAY for p in positions)
    assert all(p.total_value == 1000.0 for p in positions)


def test_parse_raises_on_missing_required_columns(tmp_path: Path):
    path = tmp_path / "bad.csv"
    path.write_text("date,account,name\n2024-01-01,a,Fund\n")

    with pytest.raises(ValueError, match="missing columns"):
        parse(path)


def test_parse_collects_all_row_errors_before_raising(tmp_path: Path):
    path = _write(
        tmp_path,
        _row("not-a-date", "a", "Fund", "1000.0"),
        _row("2024-01-01", "a", "Fund", "not-a-number"),
    )

    with pytest.raises(ValueError) as exc_info:
        parse(path)

    message = str(exc_info.value)
    assert "line 2" in message and "invalid date" in message
    assert "line 3" in message and "cannot parse value" in message


# ---------------------------------------------------------------------------
# ValuationsLoader
# ---------------------------------------------------------------------------


def test_valuations_loader_label_includes_filename(tmp_path: Path):
    path = _write(
        tmp_path, _row(_TODAY.isoformat(), "pe_fund", "Private Fund", "1000.0")
    )
    loader = ValuationsLoader(filepath=path)

    assert loader.label == f"valuations/{path.name}"


def test_valuations_loader_ignores_ticker_map_and_asset_prices(
    tmp_path: Path,
):
    path = _write(
        tmp_path, _row(_TODAY.isoformat(), "pe_fund", "Private Fund", "1000.0")
    )
    loader = ValuationsLoader(filepath=path)

    operations, positions = loader.load(
        ticker_map={"unrelated": {}}, asset_prices=pd.DataFrame({"x": [1]})
    )

    assert len(operations) == 1
    assert len(positions) == 1
