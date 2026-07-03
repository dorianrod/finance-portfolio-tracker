"""BrokerDataCollector: gathers ops/positions from every broker export."""

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from src.domain.models import Operation, Position
from src.infrastructure.broker_file_discovery import (
    discover_prefixed_broker_groups,
)
from src.infrastructure.parsers.boursorama import BoursoramaLoader
from src.infrastructure.parsers.direct import DirectLoader
from src.infrastructure.parsers.revolut import RevolutLoader
from src.infrastructure.parsers.valuations import ValuationsLoader
from src.ports.allocation_repository import AllocationRepository
from src.ports.parsers import BrokerLoader


@dataclass
class ParseFailure:
    label: str
    message: str


@dataclass
class BrokerDataCollector:
    """Runs every BrokerLoader found under input_dir and merges their output.

    A loader failing to parse its file (ValueError) doesn't stop the
    others — it's recorded as a ParseFailure for the caller to report
    however it sees fit (see PortfolioErrorDetector).
    """

    input_dir: Path
    allocation_repo: AllocationRepository

    def collect(
        self, asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position], list[ParseFailure]]:
        # Passed to every loader uniformly; only RevolutLoader uses it.
        ticker_map = self.allocation_repo.load_ticker_data()

        all_operations: list[Operation] = []
        all_positions: list[Position] = []
        failures: list[ParseFailure] = []

        for loader in self._build_loaders():
            try:
                operations, positions = loader.load(ticker_map, asset_prices)
            except ValueError as exc:
                print(f"[{loader.label}] ERROR: {exc}")
                failures.append(
                    ParseFailure(label=loader.label, message=str(exc))
                )
                continue

            all_operations.extend(operations)
            all_positions.extend(positions)
            print(
                f"[{loader.label}] {len(operations)} operations,"
                f" {len(positions)} position rows"
            )

        return all_operations, all_positions, failures

    def _build_loaders(self) -> list[BrokerLoader]:
        loaders: list[BrokerLoader] = []
        brokers_dir = self.input_dir / "brokers"

        for group in discover_prefixed_broker_groups(
            brokers_dir, "boursorama"
        ):
            loaders.append(
                BoursoramaLoader(group.files, account=group.account)
            )

        for group in discover_prefixed_broker_groups(brokers_dir, "revolut"):
            loaders.append(
                RevolutLoader(
                    group.files,
                    account=group.account,
                    label=group.label,
                )
            )

        for direct_file in sorted(
            (self.input_dir / "brokers/direct").rglob("*.csv")
        ):
            loaders.append(DirectLoader(direct_file))

        for val_file in sorted(
            (self.input_dir / "brokers/valuations").rglob("*.csv")
        ):
            loaders.append(ValuationsLoader(val_file))

        return loaders
