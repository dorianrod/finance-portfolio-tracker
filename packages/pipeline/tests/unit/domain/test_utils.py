from datetime import date, datetime, timedelta

from src.domain.models import Operation, OperationType
from src.domain.utils import month_end_dates


def test_month_end_dates_empty_returns_today():
    assert month_end_dates([]) == [date.today()]


def test_month_end_dates_spans_from_first_operation_to_today_capped():
    start_month = (date.today().replace(day=1) - timedelta(days=100)).replace(
        day=1
    )
    ops = [
        Operation(
            date=datetime.combine(start_month, datetime.min.time()),
            account="a",
            operation_type=OperationType.DEPOSIT,
            total_amount=100.0,
        ),
    ]
    dates = month_end_dates(ops)

    assert dates[0].year == start_month.year
    assert dates[0].month == start_month.month
    assert dates[-1] == date.today()
    assert len(dates) >= 3
