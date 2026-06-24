from datetime import date

from src.infrastructure.parsers.base import default_snapshot_dates


def test_default_snapshot_dates_returns_given_dates_unchanged():
    given = [date(2024, 1, 31), date(2024, 2, 29)]
    result = default_snapshot_dates(given, fallback=lambda: [date.today()])
    assert result is given


def test_default_snapshot_dates_calls_fallback_when_none():
    fallback_dates = [date(2023, 12, 31)]
    result = default_snapshot_dates(None, fallback=lambda: fallback_dates)
    assert result == fallback_dates
