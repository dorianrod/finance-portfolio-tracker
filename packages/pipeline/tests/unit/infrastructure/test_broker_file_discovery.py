from pathlib import Path

from src.infrastructure.broker_file_discovery import (
    discover_prefixed_broker_groups,
)


def _touch(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("header\n")


def test_discover_prefixed_broker_groups_normalizes_accounts_and_sorts(
    tmp_path: Path,
):
    brokers_dir = tmp_path / "brokers"
    _touch(brokers_dir / "Boursorama Bank/CTO Export/ops.csv")
    _touch(brokers_dir / "Boursorama Bank/PEA/ops.csv")
    _touch(brokers_dir / "Boursorama Bank/direct.csv")
    _touch(brokers_dir / "Other Broker/PEA/ops.csv")

    groups = discover_prefixed_broker_groups(brokers_dir, "boursorama")

    assert [(g.account, g.label) for g in groups] == [
        ("boursorama_bank", "boursorama_bank"),
        ("boursorama_bank_pea", "boursorama_bank_pea"),
        ("boursorama_bank_cto_export", "boursorama_bank_cto_export"),
    ]
    assert [g.files[0].name for g in groups] == [
        "direct.csv",
        "ops.csv",
        "ops.csv",
    ]


def test_discover_prefixed_broker_groups_returns_empty_without_brokers_dir(
    tmp_path: Path,
):
    assert (
        discover_prefixed_broker_groups(tmp_path / "missing", "revolut")
        == []
    )
