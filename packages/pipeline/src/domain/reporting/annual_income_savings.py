"""Annual comparison of net income and observed invested savings."""

import math
from typing import Any

import pandas as pd

from src.domain.errors import ErrorCollector

INPUT_COLUMNS = {
    "year",
    "total",
    "salary",
    "other",
    "gross_salary",
    "status",
}

OUTPUT_COLUMNS = [
    "year",
    "income_status",
    "net_salary",
    "other_income",
    "total_income",
    "gross_salary",
    "placed_savings",
    "savings_through",
    "savings_status",
    "placement_rate",
    "unplaced_income_proxy",
    "comparable",
]


def _empty_output() -> pd.DataFrame:
    return pd.DataFrame(columns=OUTPUT_COLUMNS)


def _add_validation_error(
    errors: ErrorCollector, *, year: str = "", message: str
) -> None:
    errors.add(
        source="salaries.csv",
        level="error",
        type="invalid_salary_data",
        date=year,
        message=message,
    )


def _parse_year(value: Any) -> int | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number) or not number.is_integer():
        return None
    year = int(number)
    return year if year >= 1900 else None


def _parse_amount(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) and number >= 0 else None


def _validated_salaries(
    salaries: pd.DataFrame, errors: ErrorCollector
) -> pd.DataFrame:
    if salaries.empty:
        return pd.DataFrame(columns=sorted(INPUT_COLUMNS))

    missing = sorted(INPUT_COLUMNS - set(salaries.columns))
    if missing:
        _add_validation_error(
            errors,
            message="Missing required column(s): " + ", ".join(missing),
        )
        return pd.DataFrame(columns=sorted(INPUT_COLUMNS))

    parsed_years = [_parse_year(value) for value in salaries["year"]]
    duplicate_years = {
        year
        for year in parsed_years
        if year is not None and parsed_years.count(year) > 1
    }
    valid_rows: list[dict[str, object]] = []

    for index, row in salaries.iterrows():
        year = _parse_year(row["year"])
        year_label = str(year) if year is not None else str(row["year"])
        row_number = int(index) + 2 if isinstance(index, int) else str(index)
        issues: list[str] = []

        if year is None:
            issues.append(
                "year must be a unique integer greater than or equal to 1900"
            )
        elif year in duplicate_years:
            issues.append(f"year {year} is duplicated")

        amounts = {
            column: _parse_amount(row[column])
            for column in ("total", "salary", "other", "gross_salary")
        }
        invalid_amounts = [
            name for name, value in amounts.items() if value is None
        ]
        total = amounts["total"]
        salary = amounts["salary"]
        other = amounts["other"]
        gross_salary = amounts["gross_salary"]
        if invalid_amounts:
            issues.append(
                "amounts must be finite and non-negative: "
                + ", ".join(invalid_amounts)
            )
        elif total == 0:
            issues.append("total income must be greater than zero")
        elif (
            total is not None
            and salary is not None
            and other is not None
            and abs(total - (salary + other)) > 0.01
        ):
            issues.append("total must equal salary + other")

        status = str(row["status"]).strip().lower()
        if status not in {"actual", "forecast"}:
            issues.append("status must be 'actual' or 'forecast'")

        if issues:
            _add_validation_error(
                errors,
                year=year_label,
                message=f"Row {row_number}: " + "; ".join(issues),
            )
            continue

        assert year is not None
        assert total is not None
        assert salary is not None
        assert other is not None
        assert gross_salary is not None

        valid_rows.append(
            {
                "year": year,
                "total": total,
                "salary": salary,
                "other": other,
                "gross_salary": gross_salary,
                "status": status,
            }
        )

    return pd.DataFrame(valid_rows, columns=sorted(INPUT_COLUMNS))


def annual_income_savings(
    salaries: pd.DataFrame,
    saving_capacity: pd.DataFrame,
    errors: ErrorCollector,
) -> pd.DataFrame:
    """Return one validated income/savings comparison row per income year."""
    valid = _validated_salaries(salaries, errors)
    if valid.empty:
        return _empty_output()

    savings_by_year: dict[int, dict[str, object]] = {}
    required_savings = {"snapshot_date", "savings_delta"}
    if (
        not saving_capacity.empty
        and required_savings <= set(saving_capacity.columns)
    ):
        savings = saving_capacity[list(required_savings)].copy()
        savings["date"] = pd.to_datetime(
            savings["snapshot_date"], errors="coerce"
        )
        savings["amount"] = pd.to_numeric(
            savings["savings_delta"], errors="coerce"
        )
        savings = savings.dropna(subset=["date", "amount"])
        savings["year"] = savings["date"].dt.year
        for year, group in savings.groupby("year"):
            months = set(group["date"].dt.month.astype(int))
            savings_by_year[int(str(year))] = {
                "placed_savings": round(
                    float(str(group["amount"].sum())), 2
                ),
                "savings_through": group["date"].max().date().isoformat(),
                "savings_status": (
                    "complete" if months == set(range(1, 13)) else "partial"
                ),
            }

    rows: list[dict[str, object]] = []
    for row in valid.sort_values("year").itertuples(index=False):
        year = int(str(row.year))
        total_income = float(str(row.total))
        annual_savings = savings_by_year.get(year)
        placed_savings = (
            float(str(annual_savings["placed_savings"]))
            if annual_savings is not None
            else None
        )
        savings_status = (
            str(annual_savings["savings_status"])
            if annual_savings is not None
            else "missing"
        )
        income_status = str(row.status)
        comparable = (
            income_status == "actual" and savings_status == "complete"
        )
        placement_rate = (
            round(placed_savings / total_income * 100, 2)
            if comparable and placed_savings is not None
            else None
        )
        unplaced_income = (
            round(total_income - placed_savings, 2)
            if comparable and placed_savings is not None
            else None
        )
        rows.append(
            {
                "year": year,
                "income_status": income_status,
                "net_salary": round(float(str(row.salary)), 2),
                "other_income": round(float(str(row.other)), 2),
                "total_income": round(total_income, 2),
                "gross_salary": round(float(str(row.gross_salary)), 2),
                "placed_savings": placed_savings,
                "savings_through": (
                    annual_savings["savings_through"]
                    if annual_savings is not None
                    else ""
                ),
                "savings_status": savings_status,
                "placement_rate": placement_rate,
                "unplaced_income_proxy": unplaced_income,
                "comparable": comparable,
            }
        )

    return pd.DataFrame(rows, columns=OUTPUT_COLUMNS)
