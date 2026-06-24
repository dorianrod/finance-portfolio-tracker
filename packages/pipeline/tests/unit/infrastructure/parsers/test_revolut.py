from datetime import date, datetime
from pathlib import Path

import pandas as pd

from src.domain.models import Operation, OperationType
from src.infrastructure.parsers.revolut import (
    RevolutLoader,
    compute_positions,
    parse_operations,
)

_HEADER = "Date,Ticker,Type,Quantity,Price per share,Currency,Total Amount\n"


def _write(tmp_path: Path, *rows: str) -> Path:
    path = tmp_path / "trading-account-statement_2024.csv"
    path.write_text(_HEADER + "\n".join(rows) + "\n", encoding="utf-8")
    return path


# ---------------------------------------------------------------------------
# parse_operations
# ---------------------------------------------------------------------------


def test_parse_operations_buy_amount_forced_negative(tmp_path: Path):
    path = _write(
        tmp_path,
        "2024-01-05T00:00:00Z,AAPL,BUY - MARKET,1,USD 150,USD,USD 150",
    )

    ops = parse_operations(path)

    assert len(ops) == 1
    op = ops[0]
    assert op.date == datetime(2024, 1, 5)
    assert op.account == "revolut"
    assert op.ticker == "AAPL"
    assert op.operation_type == OperationType.BUY
    assert op.quantity == 1.0
    assert op.price_per_unit == 150.0
    assert op.total_amount == -150.0
    assert op.currency == "USD"


def test_parse_operations_sell_amount_kept_positive(tmp_path: Path):
    path = _write(
        tmp_path,
        "2024-02-01T00:00:00Z,AAPL,SELL - MARKET,1,USD 160,USD,USD 160",
    )

    ops = parse_operations(path)

    assert ops[0].operation_type == OperationType.SELL
    assert ops[0].total_amount == 160.0


def test_parse_operations_maps_cash_and_dividend_and_defaults_unknown(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        "2024-01-01T00:00:00Z,,CASH TOP-UP,,,EUR,EUR 1000",
        "2024-01-02T00:00:00Z,,CASH WITHDRAWAL,,,EUR,EUR -200",
        "2024-01-03T00:00:00Z,AAPL,DIVIDEND,,,USD,USD 5",
        "2024-01-04T00:00:00Z,AAPL,SOME_UNKNOWN_TYPE,,,USD,USD 1",
    )

    ops = parse_operations(path)

    assert [op.operation_type for op in ops] == [
        OperationType.DEPOSIT,
        OperationType.WITHDRAWAL,
        OperationType.DIVIDEND,
        OperationType.DEPOSIT,  # unrecognized type defaults to DEPOSIT
    ]
    assert ops[0].ticker is None
    assert ops[0].quantity is None


# ---------------------------------------------------------------------------
# compute_positions
# ---------------------------------------------------------------------------


def _buy(ticker: str, d: date, quantity: float, price: float) -> Operation:
    return Operation(
        date=datetime.combine(d, datetime.min.time()),
        account="revolut",
        ticker=ticker,
        operation_type=OperationType.BUY,
        quantity=quantity,
        price_per_unit=price,
        total_amount=-quantity * price,
        currency="USD",
    )


def test_compute_positions_falls_back_to_avg_buy_price_without_a_price_match():
    ops = [_buy("AAPL", date(2024, 1, 10), 2.0, 150.0)]

    # No asset_prices rows for AAPL, ever -> falls back to avg_buy_price,
    # like the boursorama/direct parsers, instead of dropping the holding.
    positions = compute_positions(
        ops, asset_prices=pd.DataFrame(), snapshot_dates=[date(2024, 1, 31)]
    )

    assert len(positions) == 1
    assert positions[0].last_price == 150.0
    assert positions[0].unrealized_gain == 0.0


def test_compute_positions_infers_isin_from_isin_shaped_ticker():
    ops = [_buy("US0378331005", date(2024, 1, 10), 2.0, 150.0)]
    asset_prices = pd.DataFrame(
        {
            "ticker": ["US0378331005"],
            "price": [160.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )

    positions = compute_positions(
        ops, asset_prices=asset_prices, snapshot_dates=[date(2024, 1, 31)]
    )

    assert len(positions) == 1
    pos = positions[0]
    assert pos.isin == "US0378331005"
    assert pos.last_price == 160.0
    # no "name" column in the price row -> falls back to the ticker
    assert pos.name == "US0378331005"


def test_compute_positions_skips_fully_closed_holdings():
    ops = [
        _buy("AAPL", date(2024, 1, 10), 2.0, 150.0),
        Operation(
            date=datetime(2024, 1, 20),
            account="revolut",
            ticker="AAPL",
            operation_type=OperationType.SELL,
            quantity=2.0,
            price_per_unit=160.0,
            total_amount=320.0,
            currency="USD",
        ),
    ]
    asset_prices = pd.DataFrame(
        {
            "ticker": ["AAPL"],
            "price": [165.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )

    positions = compute_positions(
        ops, asset_prices=asset_prices, snapshot_dates=[date(2024, 1, 31)]
    )

    assert positions == []


# ---------------------------------------------------------------------------
# RevolutLoader
# ---------------------------------------------------------------------------


def test_revolut_loader_default_label():
    assert RevolutLoader(filepaths=[]).label == "revolut"


def test_revolut_loader_skips_positions_when_no_asset_prices(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        "2024-01-05T00:00:00Z,AAPL,BUY - MARKET,1,USD 150,USD,USD 150",
    )
    loader = RevolutLoader(filepaths=[path])

    operations, positions = loader.load(
        ticker_map={}, asset_prices=pd.DataFrame()
    )

    assert len(operations) == 1
    assert positions == []


def test_revolut_loader_enriches_isin_and_name_from_ticker_map(
    tmp_path: Path,
):
    path = _write(
        tmp_path,
        "2024-01-05T00:00:00Z,AAPL,BUY - MARKET,1,USD 150,USD,USD 150",
    )
    loader = RevolutLoader(filepaths=[path])
    ticker_map = {
        "AAPL": {
            "key": "AAPL",
            "isin": "US0378331005",
            "yahoo_symbol": "AAPL",
            "name": "Apple Inc",
            "currency": "USD",
        },
    }
    asset_prices = pd.DataFrame(
        {
            "ticker": ["AAPL"],
            "price": [160.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )

    operations, positions = loader.load(
        ticker_map=ticker_map, asset_prices=asset_prices
    )

    op = operations[0]
    assert op.isin == "US0378331005"
    assert op.name == "Apple Inc"
