from datetime import date, datetime, timedelta

from src.domain.models import Operation, OperationType
from src.domain.utils import month_end_dates


def test_month_end_dates_empty_returns_today():
    assert month_end_dates([]) == [date.today()]


def test_explicit_reporting_date_can_close_a_month_before_its_last_day(
    monkeypatch,
):
    class LoadingDate(date):
        @classmethod
        def today(cls):
            return cls(2024, 10, 30)

    monkeypatch.setattr("src.domain.utils.date", LoadingDate)
    ops = [Operation(
        date=datetime(2024, 9, 1),
        account="a",
        operation_type=OperationType.DEPOSIT,
        total_amount=100,
    )]

    assert month_end_dates(ops) == [date(2024, 9, 30), date(2024, 10, 30)]
    assert month_end_dates(ops, as_of=date(2024, 10, 31)) == [
        date(2024, 9, 30), date(2024, 10, 31)
    ]


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
