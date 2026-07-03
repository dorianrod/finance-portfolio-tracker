from pathlib import Path

import pandas as pd

from src.application.broker_data_collector import BrokerDataCollector
from src.infrastructure.parsers.boursorama import BoursoramaLoader
from src.infrastructure.parsers.revolut import RevolutLoader


class _FakeAllocationRepository:
    def load_ticker_data(self) -> dict:
        return {}


def _touch(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("header\n")


def test_build_loaders_discovers_prefixed_broker_accounts(tmp_path: Path):
    _touch(tmp_path / "brokers/Boursorama/PEA/operations.csv")
    _touch(tmp_path / "brokers/Revolut/Trading/statement.csv")

    collector = BrokerDataCollector(
        input_dir=tmp_path,
        allocation_repo=_FakeAllocationRepository(),  # pyright: ignore[reportArgumentType]
    )

    loaders = collector._build_loaders()

    assert [type(loader) for loader in loaders] == [
        BoursoramaLoader,
        RevolutLoader,
    ]
    assert [loader.account for loader in loaders] == [
        "boursorama_pea",
        "revolut_trading",
    ]
    assert loaders[1].label == "revolut_trading"


def test_collect_keeps_running_when_one_loader_fails(
    tmp_path: Path, monkeypatch
):
    collector = BrokerDataCollector(
        input_dir=tmp_path,
        allocation_repo=_FakeAllocationRepository(),  # pyright: ignore[reportArgumentType]
    )

    class FailingLoader:
        label = "bad"

        def load(self, ticker_map, asset_prices):
            raise ValueError("bad csv")

    class PassingLoader:
        label = "good"

        def load(self, ticker_map, asset_prices):
            return ["op"], ["position"]

    monkeypatch.setattr(
        collector,
        "_build_loaders",
        lambda: [FailingLoader(), PassingLoader()],
    )

    operations, positions, failures = collector.collect(pd.DataFrame())

    assert operations == ["op"]
    assert positions == ["position"]
    assert [(f.label, f.message) for f in failures] == [("bad", "bad csv")]
