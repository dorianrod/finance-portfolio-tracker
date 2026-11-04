from datetime import date
from pathlib import Path

import pandas as pd

from src import init_data_dir
from src.fund_holdings_snapshots import load_all_valid_fund_snapshots
from src.init_data_dir import main


def test_skill_installation_resyncs_bundled_files(
    tmp_path: Path, monkeypatch
) -> None:
    bundled = tmp_path / "bundled"
    source = bundled / "monthly-update"
    source.mkdir(parents=True)
    (source / "SKILL.md").write_text("Initial instructions")
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    monkeypatch.chdir(workspace)
    monkeypatch.setattr(init_data_dir, "_BUNDLED_SKILLS_DIR", bundled)

    destinations = init_data_dir._install_skills()
    destination = workspace / ".claude/skills/monthly-update"
    assert destinations == [destination]
    assert (destination / "SKILL.md").read_text() == "Initial instructions"

    (source / "SKILL.md").write_text("Updated instructions")
    (destination / "obsolete.md").write_text("Old resource")
    init_data_dir._install_skills()

    assert (destination / "SKILL.md").read_text() == "Updated instructions"
    assert not (destination / "obsolete.md").exists()


def test_skill_installation_preserves_links_to_bundled_sources(
    tmp_path: Path, monkeypatch
) -> None:
    bundled = tmp_path / "packages/pipeline/src/skills"
    source = bundled / "monthly-update"
    source.mkdir(parents=True)
    instructions = source / "SKILL.md"
    instructions.write_text("Shared instructions")
    agents = tmp_path / ".agents/skills"
    agents.mkdir(parents=True)
    entry = agents / "monthly-update"
    entry.symlink_to(
        "../../packages/pipeline/src/skills/monthly-update",
        target_is_directory=True,
    )
    custom = agents / "custom-skill"
    custom.mkdir()
    (custom / "SKILL.md").write_text("Repository-only skill")
    claude = tmp_path / ".claude"
    claude.mkdir()
    (claude / "skills").symlink_to(
        "../.agents/skills", target_is_directory=True
    )
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(init_data_dir, "_BUNDLED_SKILLS_DIR", bundled)

    for _ in range(2):
        destinations = init_data_dir._install_skills()
        assert destinations == [claude / "skills/monthly-update"]
        assert (claude / "skills").is_symlink()
        assert entry.is_symlink()
        assert instructions.read_text() == "Shared instructions"
        assert (custom / "SKILL.md").read_text() == "Repository-only skill"


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

    salaries = pd.read_csv(input_dir / "salaries.csv")
    assert salaries["total"].max() < 40000
    assert salaries.iloc[-1]["status"] == "forecast"

    employee_plan = pd.read_csv(
        input_dir / "brokers/valuations/employee_plan.csv"
    )
    private_fund = pd.read_csv(
        input_dir / "brokers/valuations/private_fund.csv"
    )
    assert employee_plan["date"].iloc[0] == "2021-12-31"
    assert private_fund["date"].iloc[0] == "2021-12-31"

    snapshots, audit = load_all_valid_fund_snapshots(
        data_dir, today=date(2026, 10, 20)
    )
    assert len(snapshots) == 13
    fund_ids = {snapshot.fund_id for snapshot in snapshots}
    assert len(fund_ids) == 4
    assert {
        "Demo employee savings fund",
        "PER Fortuneo",
    } < fund_ids
    assert {snapshot.as_of_date for snapshot in snapshots} >= {
        "2021-12-31",
        "2026-09-30",
    }
    assert set(audit["status"]) <= {"valid", "expired"}
    assert all(snapshot.origin == "synthetic_demo" for snapshot in snapshots)

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
