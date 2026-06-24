"""Shared utilities used across multiple modules."""

from calendar import monthrange
from datetime import date

from src.domain.models import Operation


def month_end_dates(operations: list[Operation]) -> list[date]:
    """Return one end-of-month date per calendar month covered by operations.

    The last date in the list is capped at today so the current (incomplete)
    month never projects beyond today.
    """
    if not operations:
        return [date.today()]
    first = min(op.date for op in operations).date()
    today = date.today()
    dates, year, month = [], first.year, first.month
    while (year, month) <= (today.year, today.month):
        last_day = monthrange(year, month)[1]
        dates.append(min(date(year, month, last_day), today))
        month += 1
        if month > 12:
            month, year = 1, year + 1
    return dates
