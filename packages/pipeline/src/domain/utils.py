"""Shared utilities used across multiple modules."""

from calendar import monthrange
from datetime import date

from src.domain.models import Operation


def month_end_dates(
    operations: list[Operation], *, as_of: date | None = None
) -> list[date]:
    """Return one end-of-month date per calendar month covered by operations.

    The last date is capped at the reporting date (today by default).
    An explicit month-end date allows an early monthly close.
    """
    today = as_of or date.today()
    if not operations:
        return [today]
    first = min(op.date for op in operations).date()
    dates, year, month = [], first.year, first.month
    while (year, month) <= (today.year, today.month):
        last_day = monthrange(year, month)[1]
        dates.append(min(date(year, month, last_day), today))
        month += 1
        if month > 12:
            month, year = 1, year + 1
    return dates
