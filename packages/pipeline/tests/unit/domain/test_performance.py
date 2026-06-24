import pandas as pd
import pytest

from src.domain.performance import (
    asset_cagr,
    monthly_dietz_returns,
    portfolio_performance,
)


def test_asset_cagr_known_case():
    idx = pd.PeriodIndex(["2023-01", "2023-02", "2023-03"], freq="M")
    monthly_val = pd.Series([1000.0, 1100.0, 1210.0], index=idx)
    monthly_inv = pd.Series([1000.0], index=idx[:1])

    cagr, twr, n_months = asset_cagr(monthly_val, monthly_inv)

    assert n_months == 3
    assert twr == pytest.approx(0.21, abs=1e-9)
    assert cagr == pytest.approx(1.21**4 - 1, abs=1e-9)


def test_asset_cagr_insufficient_data_returns_nan():
    idx = pd.PeriodIndex(["2023-01"], freq="M")
    monthly_val = pd.Series([1000.0], index=idx)
    monthly_inv = pd.Series([1000.0], index=idx)

    cagr, twr, n_months = asset_cagr(monthly_val, monthly_inv)

    assert n_months == 0
    assert pd.isna(cagr)
    assert pd.isna(twr)


def test_portfolio_performance_simple_two_months():
    positions_df = pd.DataFrame(
        {
            "snapshot_date": pd.to_datetime(["2023-01-31", "2023-02-28"]),
            "total_value": [1000.0, 1100.0],
        }
    )
    operations_df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2023-01-01"]),
            "operation_type": ["DEPOSIT"],
            "total_amount": [1000.0],
        }
    )

    result = portfolio_performance(positions_df, operations_df)

    assert list(result["tv"]) == [1000.0, 1100.0]
    assert list(result["flows"]) == [1000.0, 0.0]
    assert list(result["monthly_perf"]) == [0.0, 100.0]
    assert list(result["cum_perf"]) == [0.0, 100.0]


def test_monthly_dietz_returns_without_cash_df():
    positions_df = pd.DataFrame(
        {
            "snapshot_date": pd.to_datetime(
                ["2023-01-31", "2023-02-28", "2023-03-31"]
            ),
            "total_value": [1000.0, 1100.0, 1210.0],
        }
    )
    operations_df = pd.DataFrame(
        {
            "date": pd.to_datetime(["2023-01-01"]),
            "operation_type": ["DEPOSIT"],
            "total_amount": [1000.0],
        }
    )

    returns = monthly_dietz_returns(positions_df, operations_df)

    assert returns.name == "Portfolio"
    assert len(returns) == 2
    assert list(returns.round(6)) == [0.1, 0.1]
