from pathlib import Path

import pandas as pd
import pytest

from src.application.asset_irr import build_asset_irr


def _write_rows(
    output_dir: Path,
    positions: list[dict[str, object]],
    operations: list[dict[str, object]],
) -> None:
    output_dir.mkdir()
    pd.DataFrame(positions).to_csv(output_dir / "positions.csv", index=False)
    pd.DataFrame(operations).to_csv(output_dir / "operations.csv", index=False)


def _position(
    date: str, value: float, **overrides: object
) -> dict[str, object]:
    return {
        "snapshot_date": date,
        "account": "example-provider",
        "account_type": "PEE",
        "account_category": "employer_savings",
        "isin": "",
        "ticker": "",
        "name": "Example Employee Savings",
        "total_value": value,
        **overrides,
    }


def _operation(
    date: str,
    operation_type: str,
    amount: float,
    **overrides: object,
) -> dict[str, object]:
    return {
        "date": date,
        "account": "example-provider",
        "account_type": "PEE",
        "account_category": "employer_savings",
        "isin": "",
        "ticker": "",
        "name": "Example Employee Savings",
        "operation_type": operation_type,
        "total_amount": amount,
        **overrides,
    }


def test_asset_irr_neutralizes_cash_added_during_filtered_period(
    tmp_path: Path,
):
    output_dir = tmp_path / "output"
    _write_rows(
        output_dir,
        [
            _position("2026-06-30", 87_075),
            _position("2026-10-13", 112_433),
        ],
        [
            _operation("2026-07-31", "DEPOSIT", 23_449),
            _operation("2026-07-31", "BUY", -23_449),
        ],
    )

    result = build_asset_irr(
        output_dir,
        date_from="2026-06-30",
        date_to="2026-10-13",
    )

    assert result["start_date"] == "2026-06-30"
    assert result["end_date"] == "2026-10-13"
    assert result["assets"] == [
        {
            "key": "name:example employee savings",
            "label": "Example Employee Savings",
            "name": "Example Employee Savings",
            "irr": pytest.approx(6.5604),
            "value": 112_433,
            "accounts": ["example-provider"],
            "account_types": ["PEE"],
        }
    ]


def test_cash_balance_deposits_produce_zero_irr_not_price_return(
    tmp_path: Path,
):
    output_dir = tmp_path / "output"
    _write_rows(
        output_dir,
        [
            _position(
                "2026-06-30",
                2_960,
                account="savings",
                account_type="Livret",
                account_category="savings",
                name="Example Savings Account",
            ),
            _position(
                "2026-10-13",
                5_960,
                account="savings",
                account_type="Livret",
                account_category="savings",
                name="Example Savings Account",
            ),
        ],
        [
            _operation(
                "2026-07-31",
                "DEPOSIT",
                3_000,
                account="savings",
                account_type="Livret",
                account_category="savings",
                name="Example Savings Account",
            )
        ],
    )

    result = build_asset_irr(
        output_dir,
        date_from="2026-06-30",
        date_to="2026-10-13",
    )

    assert result["assets"][0]["irr"] == pytest.approx(0.0, abs=0.0001)


def test_asset_irr_uses_descriptive_name_instead_of_ticker(tmp_path: Path):
    output_dir = tmp_path / "output"
    identity = {
        "isin": "XX0000000001",
        "ticker": "TST1",
        "name": "Example Global Equity Fund",
    }
    _write_rows(
        output_dir,
        [
            _position("2025-01-01", 100, **identity),
            _position("2026-01-01", 110, **identity),
        ],
        [_operation("2025-01-01", "BUY", -100, **identity)],
    )

    result = build_asset_irr(output_dir)

    assert result["assets"][0]["label"] == identity["name"]


def test_generic_cash_balance_uses_signed_deposits_and_withdrawals(
    tmp_path: Path,
):
    output_dir = tmp_path / "output"
    _write_rows(
        output_dir,
        [
            _position(
                "2026-01-01",
                1_000,
                account="cash-account",
                account_type="Cash account",
                account_category="savings",
                name="Cash reserve",
            ),
            _position(
                "2026-12-31",
                600,
                account="cash-account",
                account_type="Cash account",
                account_category="savings",
                name="Cash reserve",
            ),
        ],
        [
            _operation(
                "2026-06-30",
                "DEPOSIT",
                -400,
                account="cash-account",
                account_type="Cash account",
                account_category="savings",
                name="Cash reserve",
            )
        ],
    )

    result = build_asset_irr(
        output_dir,
        date_from="2026-01-01",
        date_to="2026-12-31",
    )

    assert result["assets"][0]["irr"] == pytest.approx(0.0, abs=0.0001)


def test_synthetic_brokerage_cash_is_excluded(tmp_path: Path):
    output_dir = tmp_path / "output"
    _write_rows(
        output_dir,
        [
            _position(
                "2026-10-13",
                500,
                account="broker",
                account_type="Bourse – Cash",
                account_category="brokerage",
                name="Cash PEA",
            )
        ],
        [
            _operation(
                "2026-01-01",
                "DEPOSIT",
                500,
                account="broker",
                account_type="Bourse",
                account_category="brokerage",
                name="Cash PEA",
            )
        ],
    )

    result = build_asset_irr(output_dir)

    assert result == {
        "available": False,
        "start_date": None,
        "end_date": None,
        "assets": [],
    }
