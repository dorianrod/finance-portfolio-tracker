import pandas as pd

from src.application.portfolio_error_detector import PortfolioErrorDetector


class _FakeAssetPriceRepository:
    def load_ticker_map_errors(self) -> pd.DataFrame:
        return pd.DataFrame()


def _detector() -> PortfolioErrorDetector:
    return PortfolioErrorDetector(
        _FakeAssetPriceRepository()  # pyright: ignore[reportArgumentType]
    )


def test_detect_reports_missing_currency_instead_of_nan_fx_rate():
    asset_prices = pd.DataFrame(
        [
            {
                "isin": "IE00TEST",
                "ticker": "TEST",
                "name": "Test ETF",
                "price": 42.0,
                "currency": None,
                "price_eur": None,
                "date": "2026-06-30",
            }
        ]
    )

    errors = _detector().detect(asset_prices, [], []).to_df()

    assert errors["type"].tolist() == ["missing_currency"]
    assert errors.iloc[0]["date"] == "2026-06"
    assert "Currency missing" in errors.iloc[0]["message"]


def test_detect_keeps_missing_fx_rate_when_currency_is_known():
    asset_prices = pd.DataFrame(
        [
            {
                "isin": "IE00TEST",
                "ticker": "TEST",
                "name": "Test ETF",
                "price": 42.0,
                "currency": "USD",
                "price_eur": None,
                "date": "2026-06-30",
            }
        ]
    )

    errors = _detector().detect(asset_prices, [], []).to_df()

    assert errors["type"].tolist() == ["missing_fx_rate"]
    assert "EUR/USD exchange rate not found" in errors.iloc[0]["message"]
