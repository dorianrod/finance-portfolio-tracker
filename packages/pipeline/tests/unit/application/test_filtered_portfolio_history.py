from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

from src.application.filtered_portfolio_history import (
    UnknownAccountsError,
    accounts_excluding_category,
    build_filtered_portfolio_history,
    main,
)


def _write_outputs(output_dir: Path) -> None:
    output_dir.mkdir()
    position_rows = []
    for snapshot_date, values in (
        ("2024-01-01", {"a": 1000.0, "b": 1000.0}),
        ("2025-01-01", {"a": 900.0, "b": 1100.0}),
    ):
        for account, value in values.items():
            position_rows.append(
                {
                    "snapshot_date": snapshot_date,
                    "account": account,
                    "account_type": "Brokerage",
                    "account_category": (
                        "private_equity" if account == "b" else "brokerage"
                    ),
                    "isin": "",
                    "ticker": "",
                    "name": f"Asset {account}",
                    "quantity": value,
                    "avg_buy_price": 1,
                    "last_price": 1,
                    "total_value": value,
                    "unrealized_gain": 0,
                    "unrealized_gain_pct": 0,
                    "realized_gain": 0,
                    "tax_rate": 0.3,
                }
            )
    pd.DataFrame(position_rows).to_csv(
        output_dir / "positions.csv", index=False
    )
    pd.DataFrame(
        [
            {
                "date": "2024-07-01 00:00:00",
                "account": "a",
                "operation_type": "DEPOSIT",
                "total_amount": -100,
                "currency": "EUR",
            },
            {
                "date": "2024-07-01 00:00:00",
                "account": "b",
                "operation_type": "DEPOSIT",
                "total_amount": 100,
                "currency": "EUR",
            },
        ]
    ).to_csv(output_dir / "operations.csv", index=False)


def test_all_accounts_keep_an_internal_transfer_neutral(tmp_path: Path):
    output_dir = tmp_path / "output"
    _write_outputs(output_dir)

    payload = build_filtered_portfolio_history(output_dir, [])

    assert payload["accounts"] == ["a", "b"]
    assert payload["history"][-1]["total_value"] == 2000.0
    assert payload["history"][-1]["tri"] == pytest.approx(0.0, abs=0.01)
    assert payload["history"][-1]["tri_rolling_1y"] == pytest.approx(
        0.0, abs=0.01
    )


def test_excluding_transfer_destination_makes_it_an_external_flow(
    tmp_path: Path,
):
    output_dir = tmp_path / "output"
    _write_outputs(output_dir)

    payload = build_filtered_portfolio_history(output_dir, ["a"])

    assert payload["accounts"] == ["a"]
    assert payload["history"][-1]["total_value"] == 900.0
    assert payload["history"][-1]["net_cash_injected"] == -100.0
    assert payload["history"][-1]["tri"] == pytest.approx(0.0, abs=0.01)


def test_unknown_account_is_rejected(tmp_path: Path):
    output_dir = tmp_path / "output"
    _write_outputs(output_dir)

    with pytest.raises(UnknownAccountsError, match="missing"):
        build_filtered_portfolio_history(output_dir, ["missing"])


def test_accounts_can_be_selected_by_excluded_category(tmp_path: Path):
    output_dir = tmp_path / "output"
    _write_outputs(output_dir)

    assert accounts_excluding_category(output_dir, "private_equity") == ["a"]


def test_demo_fixture_uses_the_api_contract(tmp_path: Path):
    output_dir = tmp_path / "output"
    destination = tmp_path / "demo.json"
    _write_outputs(output_dir)

    main(
        [
            "--output-dir",
            str(output_dir),
            "--destination",
            str(destination),
            "--exclude-category",
            "private_equity",
        ]
    )

    payload = json.loads(destination.read_text(encoding="utf-8"))
    assert payload["accounts"] == ["a"]
    assert payload["history"][-1]["tri"] == pytest.approx(0.0, abs=0.01)
