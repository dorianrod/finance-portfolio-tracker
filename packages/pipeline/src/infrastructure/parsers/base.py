"""Shared plumbing for the statement parsers."""

from collections.abc import Callable
from datetime import date


def default_snapshot_dates(
    snapshot_dates: list[date] | None,
    fallback: Callable[[], list[date]],
) -> list[date]:
    """Return snapshot_dates unchanged, or call fallback() when it's None.

    Each parser has its own notion of "no snapshot_dates given" — boursorama
    and revolut default to [today], direct defaults to month_end_dates of
    its operations — so the default itself stays the caller's choice.
    """
    if snapshot_dates is not None:
        return snapshot_dates
    return fallback()
