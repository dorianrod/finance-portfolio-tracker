from pathlib import Path

from src.infrastructure.file_broker_loader_source import (
    FileBrokerLoaderSource,
)
from src.infrastructure.parsers.boursorama import BoursoramaLoader
from src.infrastructure.parsers.revolut import RevolutLoader


def _touch(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("header\n")


def test_discovers_prefixed_broker_accounts(tmp_path: Path):
    _touch(tmp_path / "brokers/Boursorama/PEA/operations.csv")
    _touch(tmp_path / "brokers/Revolut/Trading/statement.csv")

    loaders = FileBrokerLoaderSource(tmp_path).discover()

    assert [type(loader) for loader in loaders] == [
        BoursoramaLoader,
        RevolutLoader,
    ]
    boursorama_loader = loaders[0]
    revolut_loader = loaders[1]
    assert isinstance(boursorama_loader, BoursoramaLoader)
    assert isinstance(revolut_loader, RevolutLoader)
    assert boursorama_loader.account == "boursorama_pea"
    assert revolut_loader.account == "revolut_trading"
    assert revolut_loader.label == "revolut_trading"
