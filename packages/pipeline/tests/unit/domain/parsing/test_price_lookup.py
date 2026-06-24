import pandas as pd
import pytest

from src.domain.parsing.price_lookup import PriceLookup


@pytest.mark.parametrize("asset_prices", [None, pd.DataFrame()])
def test_lookups_return_none_for_empty_or_missing_asset_prices(asset_prices):
    lookup = PriceLookup(asset_prices)

    assert lookup.get_row(2024, 1, "FR1") is None
    assert lookup.get_price_eur_or_price(2024, 1, "FR1") is None


def test_lookups_return_none_when_date_column_missing():
    asset_prices = pd.DataFrame({"isin": ["FR1"], "price": [100.0]})
    lookup = PriceLookup(asset_prices)

    assert lookup.get_row(2024, 1, "FR1") is None


def test_get_row_keyed_by_year_month_and_raw_value():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1"],
            "price": [100.0],
            "currency": ["EUR"],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    row = lookup.get_row(2024, 1, "FR1")

    assert row is not None
    assert row["currency"] == "EUR"
    assert row["price"] == 100.0
    assert lookup.get_row(2024, 2, "FR1") is None
    assert lookup.get_row(2024, 1, "FR2") is None


def test_get_row_excludes_rows_with_missing_or_blank_key():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1", "", None],
            "price": [100.0, 50.0, 25.0],
            "date": pd.to_datetime(["2024-01-31"] * 3),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    assert lookup.get_row(2024, 1, "FR1") is not None
    assert lookup.get_row(2024, 1, "") is None


def test_get_row_last_row_wins_on_collision_within_same_month():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1", "FR1"],
            "price": [100.0, 200.0],
            "date": pd.to_datetime(["2024-01-05", "2024-01-20"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    row = lookup.get_row(2024, 1, "FR1")
    assert row is not None
    assert row["price"] == 200.0


def test_get_price_eur_or_price_prefers_price_eur_over_price():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1"],
            "price": [100.0],
            "price_eur": [105.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    assert lookup.get_price_eur_or_price(2024, 1, "FR1") == 105.0


def test_get_price_eur_or_price_falls_back_to_price_when_no_price_eur():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1"],
            "price": [100.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    assert lookup.get_price_eur_or_price(2024, 1, "FR1") == 100.0


def test_get_price_eur_or_price_strips_whitespace_from_key():
    asset_prices = pd.DataFrame(
        {
            "isin": [" FR1 "],
            "price": [100.0],
            "date": pd.to_datetime(["2024-01-31"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    assert lookup.get_price_eur_or_price(2024, 1, "FR1") == 100.0


def test_get_price_eur_or_price_first_row_wins_on_collision():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1", "FR1"],
            "price": [100.0, 200.0],
            "date": pd.to_datetime(["2024-01-05", "2024-01-20"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin",))

    assert lookup.get_price_eur_or_price(2024, 1, "FR1") == 100.0


def test_multiple_key_columns_are_indexed_independently():
    asset_prices = pd.DataFrame(
        {
            "isin": ["FR1", None],
            "ticker": [None, "AAPL"],
            "price": [100.0, 150.0],
            "date": pd.to_datetime(["2024-01-31", "2024-01-31"]),
        }
    )
    lookup = PriceLookup(asset_prices, key_columns=("isin", "ticker"))

    assert lookup.get_row(2024, 1, "FR1") is not None
    assert lookup.get_row(2024, 1, "AAPL") is not None
    assert lookup.get_price_eur_or_price(2024, 1, "FR1") == 100.0
    assert lookup.get_price_eur_or_price(2024, 1, "AAPL") == 150.0
