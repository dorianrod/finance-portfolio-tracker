import pandas as pd

from src.domain.validation import check_positions


def _positions_df(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows)


_OPERATIONS_COLUMNS = [
    "date",
    "account",
    "operation_type",
    "isin",
    "ticker",
    "quantity",
    "total_amount",
]


def _operations_df(rows: list[dict]) -> pd.DataFrame:
    # explicit columns so an empty list still yields the columns
    # check_positions expects, rather than a column-less frame
    return pd.DataFrame(rows, columns=_OPERATIONS_COLUMNS)


def _position_row(
    snapshot_date: str,
    isin: str | None = "FR1",
    ticker: str | None = None,
    quantity: float = 10.0,
    total_value: float = 1000.0,
) -> dict:
    return {
        "snapshot_date": snapshot_date,
        "account": "a",
        "isin": isin,
        "ticker": ticker,
        "name": "Total",
        "quantity": quantity,
        "total_value": total_value,
    }


def _operation_row(
    operation_type: str,
    isin: str | None = "FR1",
    ticker: str | None = None,
) -> dict:
    return {
        "date": "2024-01-01",
        "account": "a",
        "operation_type": operation_type,
        "isin": isin,
        "ticker": ticker,
        "quantity": 1.0,
        "total_amount": -100.0,
    }


def test_check_positions_no_issues_returns_empty_list():
    positions = _positions_df([_position_row("2024-01-31")])
    operations = _operations_df([_operation_row("BUY")])

    assert check_positions(positions, operations) == []


def test_check_positions_flags_negative_quantity():
    positions = _positions_df(
        [_position_row("2024-01-31", quantity=-1.0, total_value=100.0)]
    )

    issues = check_positions(positions, _operations_df([]))

    assert len(issues) == 1
    message, detail = issues[0]
    assert "negative quantity" in message
    assert detail is not None
    assert len(detail) == 1


def test_check_positions_zero_value_in_older_snapshot_is_not_flagged():
    positions = _positions_df(
        [
            _position_row("2024-01-31", isin="FR1", total_value=0.0),
            _position_row("2024-02-29", isin="FR2", total_value=500.0),
        ]
    )

    assert check_positions(positions, _operations_df([])) == []


def test_check_positions_flags_zero_value_in_latest_snapshot():
    positions = _positions_df(
        [_position_row("2024-02-29", isin="FR1", total_value=0.0)]
    )

    issues = check_positions(positions, _operations_df([]))

    assert len(issues) == 1
    message, detail = issues[0]
    assert "latest snapshot" in message
    assert detail is not None
    assert detail.iloc[0]["isin"] == "FR1"


def test_check_positions_flags_duplicate_rows():
    positions = _positions_df(
        [
            _position_row("2024-01-31", isin="FR1"),
            _position_row("2024-01-31", isin="FR1"),
        ]
    )

    issues = check_positions(positions, _operations_df([]))

    matching = [(m, d) for m, d in issues if "duplicate" in m]
    assert len(matching) == 1
    message, detail = matching[0]
    assert "2 duplicate rows" in message
    assert detail is not None
    assert len(detail) == 2


def test_check_positions_flags_buy_sell_missing_isin_and_ticker():
    positions = _positions_df([_position_row("2024-01-31")])
    operations = _operations_df(
        [
            _operation_row("BUY", isin=None, ticker=None),
            _operation_row("BUY", isin="FR1", ticker=None),
            _operation_row("SELL", isin=None, ticker="AAPL"),
            _operation_row("DEPOSIT", isin=None, ticker=None),
        ]
    )

    issues = check_positions(positions, operations)

    matching = [m for m, _ in issues if "without ISIN or ticker" in m]
    assert len(matching) == 1
    assert "1 BUY/SELL operations" in matching[0]
