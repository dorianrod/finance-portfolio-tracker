from datetime import date

from src.application.fetch_prices import PriceDiscrepancy
from src.ingest_portfolio import (
    _confirm_current_month_refetch,
    _parse_args,
    _resolve_price_discrepancy,
)


def _discrepancy() -> PriceDiscrepancy:
    return PriceDiscrepancy(
        key="FR000A",
        name="Asset A",
        previous_month="2026-05",
        previous_price_eur=10.0,
        new_month="2026-06",
        new_price_eur=12.5,
    )


def test_parse_args_defaults_to_interactive_policies():
    args = _parse_args([])

    assert args.update_current_month == "ask"
    assert args.price_jump_policy == "ask"


def test_current_month_policy_can_answer_without_prompt():
    assert _confirm_current_month_refetch(date(2026, 7, 31), "yes") is True
    assert _confirm_current_month_refetch(date(2026, 7, 31), "no") is False


def test_price_jump_policy_can_use_fetched_price_without_prompt():
    assert _resolve_price_discrepancy(_discrepancy(), "fetched") == 12.5


def test_price_jump_policy_can_use_last_price_without_prompt():
    assert _resolve_price_discrepancy(_discrepancy(), "last") == 10.0
