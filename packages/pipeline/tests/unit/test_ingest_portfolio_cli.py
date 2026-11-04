from datetime import date
from pathlib import Path

import pytest

from src.application.fetch_prices import PriceDiscrepancy
from src.ingest_portfolio import (
    _confirm_current_month_refetch,
    _parse_args,
    _resolve_price_discrepancy,
    main,
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
    assert args.as_of is None


def test_parse_args_accepts_month_end_reporting_date():
    assert _parse_args(["--as-of", "2024-10-31"]).as_of == date(2024, 10, 31)


def test_parse_args_rejects_invalid_reporting_date():
    with pytest.raises(SystemExit):
        _parse_args(["--as-of", "2024-10-32"])


def test_duplicate_exports_stop_cli_without_touching_outputs(tmp_path: Path):
    folder = tmp_path / "input/brokers/boursorama/PEA"
    folder.mkdir(parents=True)
    content = (
        "date_operation,date_valeur,nom_valeur,libelle,isin,quantite,"
        "cours,montant\n01/01/2024,01/01/2024,,VIR,,,,1000\n"
    )
    for name in ["original.csv", "overlap.csv"]:
        (folder / name).write_text(content)
    output = tmp_path / "output"
    output.mkdir()
    (output / "operations.csv").write_text("existing output\n")

    with pytest.raises(SystemExit, match="Import blocked:.*repeated"):
        main(["--data-dir", str(tmp_path)])

    assert list(output.iterdir()) == [output / "operations.csv"]
    assert (output / "operations.csv").read_text() == "existing output\n"


def test_current_month_policy_can_answer_without_prompt():
    assert _confirm_current_month_refetch(date(2026, 7, 31), "yes") is True
    assert _confirm_current_month_refetch(date(2026, 7, 31), "no") is False


def test_price_jump_policy_can_use_fetched_price_without_prompt():
    assert _resolve_price_discrepancy(_discrepancy(), "fetched") == 12.5


def test_price_jump_policy_can_use_last_price_without_prompt():
    assert _resolve_price_discrepancy(_discrepancy(), "last") == 10.0
