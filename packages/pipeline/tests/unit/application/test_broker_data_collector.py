from datetime import datetime
from typing import cast

import pandas as pd
import pytest

from src.application.broker_data_collector import BrokerDataCollector
from src.domain.models import Operation, OperationType
from src.ports.parsers import BrokerLoader


class _FakeAllocationRepository:
    def load_ticker_data(self) -> dict:
        return {}


class _LoaderSource:
    def __init__(self, loaders: list[object]) -> None:
        self.loaders = loaders

    def discover(self) -> list[BrokerLoader]:
        return cast(list[BrokerLoader], self.loaders)


def test_collect_keeps_running_when_one_loader_fails():
    class FailingLoader:
        label = "bad"

        def load(self, ticker_map, asset_prices):
            raise ValueError("bad csv")

    class PassingLoader:
        label = "good"

        def load(self, ticker_map, asset_prices):
            return ["op"], ["position"]

    collector = BrokerDataCollector(
        loader_source=_LoaderSource([FailingLoader(), PassingLoader()]),
        allocation_repo=_FakeAllocationRepository(),  # pyright: ignore[reportArgumentType]
    )

    operations, positions, failures = collector.collect(pd.DataFrame())

    assert operations == ["op"]
    assert positions == ["position"]
    assert [(f.label, f.message) for f in failures] == [("bad", "bad csv")]


def test_collect_rejects_account_emitted_by_multiple_sources():
    class Loader:
        def __init__(self, label: str):
            self.label = label

        def load(self, ticker_map, asset_prices):
            return [
                Operation(
                    date=datetime(2024, 1, 1),
                    account="shared",
                    operation_type=OperationType.DEPOSIT,
                    total_amount=100.0,
                )
            ], []

    collector = BrokerDataCollector(
        loader_source=_LoaderSource(
            [Loader("direct/a.csv"), Loader("valuations/b.csv")]
        ),
        allocation_repo=_FakeAllocationRepository(),  # pyright: ignore[reportArgumentType]
    )

    pattern = "shared.*direct/a.csv.*valuations/b.csv"
    with pytest.raises(ValueError, match=pattern):
        collector.collect(pd.DataFrame())
