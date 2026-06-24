"""Tests for YahooMarketDataClient.

yfinance (yf.download / yf.Ticker) is the only network boundary here, so
every test patches it directly — no real network access is made. Delays
are disabled via download_delay=0/batch_delay=0 rather than mocking
time.sleep.
"""

from datetime import date
from unittest.mock import patch

import pandas as pd

from src.infrastructure.yahoo_market_data_client import YahooMarketDataClient

_MODULE = "src.infrastructure.yahoo_market_data_client"


def _client() -> YahooMarketDataClient:
    return YahooMarketDataClient(download_delay=0, batch_delay=0)


# ---------------------------------------------------------------------------
# probe_symbol
# ---------------------------------------------------------------------------


def test_probe_symbol_true_when_history_present():
    with patch(
        f"{_MODULE}.yf.download",
        return_value=pd.DataFrame({"Close": [1.0]}),
    ):
        assert _client().probe_symbol("AAPL") is True


def test_probe_symbol_false_when_history_empty():
    with patch(f"{_MODULE}.yf.download", return_value=pd.DataFrame()):
        assert _client().probe_symbol("UNKNOWN") is False


def test_probe_symbol_false_when_history_is_none():
    with patch(f"{_MODULE}.yf.download", return_value=None):
        assert _client().probe_symbol("UNKNOWN") is False


def test_probe_symbol_false_on_exception():
    with patch(f"{_MODULE}.yf.download", side_effect=RuntimeError("boom")):
        assert _client().probe_symbol("AAPL") is False


# ---------------------------------------------------------------------------
# fetch_currency
# ---------------------------------------------------------------------------


class _FastInfo:
    def __init__(self, currency):
        self.currency = currency


class _FakeTicker:
    def __init__(self, currency=None):
        self._currency = currency

    @property
    def fast_info(self):
        return _FastInfo(self._currency)


def test_fetch_currency_returns_currency_from_fast_info():
    with patch(
        f"{_MODULE}.yf.Ticker", return_value=_FakeTicker(currency="USD")
    ):
        assert _client().fetch_currency("AAPL") == "USD"


def test_fetch_currency_returns_empty_string_when_currency_missing():
    with patch(
        f"{_MODULE}.yf.Ticker", return_value=_FakeTicker(currency=None)
    ):
        assert _client().fetch_currency("AAPL") == ""


def test_fetch_currency_returns_empty_string_on_exception():
    with patch(f"{_MODULE}.yf.Ticker", side_effect=RuntimeError("boom")):
        assert _client().fetch_currency("AAPL") == ""


# ---------------------------------------------------------------------------
# download_close_prices
# ---------------------------------------------------------------------------


def test_download_close_prices_returns_close_columns_for_multiple_symbols():
    dates = pd.to_datetime(["2024-01-31", "2024-02-29"])
    columns = pd.MultiIndex.from_tuples(
        [("Close", "AAA"), ("Close", "BBB"), ("Open", "AAA"), ("Open", "BBB")]
    )
    raw = pd.DataFrame(
        [[10.0, 20.0, 9.0, 19.0], [11.0, 21.0, 10.0, 20.0]],
        index=dates,
        columns=columns,
    )

    with patch(f"{_MODULE}.yf.download", return_value=raw) as mock_download:
        result = _client().download_close_prices(
            ["AAA", "BBB"], date(2024, 1, 1)
        )

    mock_download.assert_called_once()
    assert list(result.columns) == ["AAA", "BBB"]
    assert result.loc[dates[0], "AAA"] == 10.0
    assert result.loc[dates[1], "BBB"] == 21.0


def test_download_close_prices_wraps_single_symbol_series_into_dataframe():
    dates = pd.to_datetime(["2024-01-31", "2024-02-29"])
    # yfinance returns flat (non-MultiIndex) columns for a single symbol,
    # so raw["Close"] comes back as a Series rather than a DataFrame.
    raw = pd.DataFrame(
        {"Open": [9.0, 10.0], "Close": [10.0, 11.0]}, index=dates
    )

    with patch(f"{_MODULE}.yf.download", return_value=raw):
        result = _client().download_close_prices(["AAA"], date(2024, 1, 1))

    assert list(result.columns) == ["AAA"]
    assert result["AAA"].tolist() == [10.0, 11.0]


def test_download_close_prices_empty_when_no_data():
    with patch(f"{_MODULE}.yf.download", return_value=pd.DataFrame()):
        assert _client().download_close_prices(
            ["AAA"], date(2024, 1, 1)
        ).empty

    with patch(f"{_MODULE}.yf.download", return_value=None):
        assert _client().download_close_prices(
            ["AAA"], date(2024, 1, 1)
        ).empty


# ---------------------------------------------------------------------------
# download_fx_rates
# ---------------------------------------------------------------------------


def test_download_fx_rates_skips_unsupported_and_eur_currencies():
    with patch(f"{_MODULE}.yf.download") as mock_download:
        result = _client().download_fx_rates({"EUR", "XYZ"}, date(2024, 1, 1))

    mock_download.assert_not_called()
    assert result == {}


def test_download_fx_rates_keeps_last_trading_day_per_month():
    dates = pd.to_datetime(["2024-01-30", "2024-01-31", "2024-02-29"])
    columns = pd.MultiIndex.from_tuples([("Close", "EURUSD=X")])
    raw = pd.DataFrame(
        [[1.08], [1.09], [1.10]], index=dates, columns=columns
    )

    with patch(f"{_MODULE}.yf.download", return_value=raw):
        result = _client().download_fx_rates({"USD"}, date(2024, 1, 1))

    assert result == {
        (2024, 1, "USD"): 1.09,
        (2024, 2, "USD"): 1.10,
    }


def test_download_fx_rates_handles_single_symbol_flat_columns():
    dates = pd.to_datetime(["2024-01-31"])
    raw = pd.DataFrame({"Open": [1.07], "Close": [1.08]}, index=dates)

    with patch(f"{_MODULE}.yf.download", return_value=raw):
        result = _client().download_fx_rates({"USD"}, date(2024, 1, 1))

    assert result == {(2024, 1, "USD"): 1.08}


def test_download_fx_rates_empty_when_no_data():
    with patch(f"{_MODULE}.yf.download", return_value=pd.DataFrame()):
        result = _client().download_fx_rates({"USD"}, date(2024, 1, 1))
    assert result == {}
