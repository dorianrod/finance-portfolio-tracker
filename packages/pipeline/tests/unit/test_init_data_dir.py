from pathlib import Path

import pandas as pd

from src.init_data_dir import main


def test_init_creates_a_fully_synthetic_feature_complete_demo(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.chdir(tmp_path)
    data_dir = tmp_path / "demo-data"

    main(["--data-dir", str(data_dir)])

    input_dir = data_dir / "input"
    groups = pd.read_csv(input_dir / "account_groups.csv")
    assert set(groups["category"]) == {
        "brokerage",
        "checking",
        "employer_savings",
        "retirement",
        "savings",
        "private_equity",
    }
    assert set(groups.loc[groups["type"] == "Livret", "account"]) == {
        "livret"
    }

    employee_plan = pd.read_csv(
        input_dir / "brokers/valuations/employee_plan.csv"
    )
    private_fund = pd.read_csv(
        input_dir / "brokers/valuations/private_fund.csv"
    )
    assert employee_plan["date"].iloc[0] == "2021-12-31"
    assert private_fund["date"].iloc[0] == "2021-12-31"

    allocations = pd.read_excel(
        input_dir / "allocations/2021-01-01.xlsx", header=1
    )
    assert {
        "Demo savings account",
        "Demo employee savings fund",
        "PER Fortuneo",
        "Life insurance",
        "Demo private equity fund",
    } <= set(allocations["nom_placement"])
