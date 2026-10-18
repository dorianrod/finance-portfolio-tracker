import pandas as pd

from src.domain.errors import ErrorCollector
from src.domain.reporting.annual_income_savings import annual_income_savings


def _salaries(rows: list[dict] | None = None) -> pd.DataFrame:
    return pd.DataFrame(
        rows
        or [
            {
                "year": 2025,
                "total": 60000,
                "salary": 50000,
                "other": 10000,
                "gross_salary": 75000,
                "status": "actual",
            }
        ]
    )


def _monthly_savings(year: int, months: int = 12) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "snapshot_date": [
                (pd.Timestamp(year, month, 1) + pd.offsets.MonthEnd(0)).date()
                for month in range(1, months + 1)
            ],
            "savings_delta": [1000.0] * months,
        }
    )


def test_builds_comparable_actual_year_and_rates():
    errors = ErrorCollector()

    result = annual_income_savings(_salaries(), _monthly_savings(2025), errors)

    assert len(errors) == 0
    assert result.iloc[0].to_dict() == {
        "year": 2025,
        "income_status": "actual",
        "net_salary": 50000.0,
        "other_income": 10000.0,
        "total_income": 60000.0,
        "gross_salary": 75000.0,
        "placed_savings": 12000.0,
        "savings_through": "2025-12-31",
        "savings_status": "complete",
        "placement_rate": 20.0,
        "unplaced_income_proxy": 48000.0,
        "comparable": True,
    }


def test_forecast_and_incomplete_years_have_no_rate_or_proxy():
    salaries = _salaries(
        [
            {
                "year": 2026,
                "total": 72000,
                "salary": 60000,
                "other": 12000,
                "gross_salary": 90000,
                "status": "forecast",
            }
        ]
    )
    result = annual_income_savings(
        salaries, _monthly_savings(2026, months=10), ErrorCollector()
    )

    row = result.iloc[0]
    assert row["placed_savings"] == 10000
    assert row["savings_through"] == "2026-10-31"
    assert row["savings_status"] == "partial"
    assert bool(row["comparable"]) is False
    assert pd.isna(row["placement_rate"])
    assert pd.isna(row["unplaced_income_proxy"])


def test_missing_savings_keeps_income_as_non_comparable():
    result = annual_income_savings(
        _salaries(), pd.DataFrame(), ErrorCollector()
    )

    row = result.iloc[0]
    assert pd.isna(row["placed_savings"])
    assert row["savings_through"] == ""
    assert row["savings_status"] == "missing"
    assert bool(row["comparable"]) is False


def test_rejects_missing_columns():
    errors = ErrorCollector()

    result = annual_income_savings(
        _salaries().drop(columns="status"), pd.DataFrame(), errors
    )

    assert result.empty
    assert len(errors) == 1
    assert "status" in errors.to_df().iloc[0]["message"]


def test_rejects_duplicate_years_and_invalid_rows():
    valid = _salaries().iloc[0].to_dict()
    invalid_total = {
        **valid,
        "year": 2024,
        "total": 1,
    }
    invalid_status = {
        **valid,
        "year": 2023,
        "status": "estimated",
    }
    invalid_amount = {
        **valid,
        "year": 2022,
        "salary": "unknown",
    }
    errors = ErrorCollector()

    result = annual_income_savings(
        _salaries(
            [valid, valid, invalid_total, invalid_status, invalid_amount]
        ),
        pd.DataFrame(),
        errors,
    )

    assert result.empty
    messages = " ".join(errors.to_df()["message"])
    assert "duplicated" in messages
    assert "total must equal salary + other" in messages
    assert "status must be" in messages
    assert "finite and non-negative" in messages


def test_rejects_zero_total_income():
    errors = ErrorCollector()
    zero = _salaries().iloc[0].to_dict()
    zero.update(total=0, salary=0, other=0)

    result = annual_income_savings(
        _salaries([zero]), pd.DataFrame(), errors
    )

    assert result.empty
    assert "greater than zero" in errors.to_df().iloc[0]["message"]
