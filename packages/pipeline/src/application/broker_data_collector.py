"""BrokerDataCollector: gathers ops/positions from every broker export."""

from dataclasses import dataclass

import pandas as pd

from src.domain.models import Operation, Position
from src.ports.allocation_repository import AllocationRepository
from src.ports.parsers import BrokerLoaderSource


@dataclass
class ParseFailure:
    label: str
    message: str


@dataclass
class BrokerDataCollector:
    """Runs every discovered BrokerLoader and merges their output.

    A loader failing to parse its file (ValueError) doesn't stop the
    others — it's recorded as a ParseFailure for the caller to report
    however it sees fit (see PortfolioErrorDetector). An account emitted by
    more than one successful loader is different: its cash-flow provenance
    would be ambiguous, so collection stops with an explicit error.
    """

    loader_source: BrokerLoaderSource
    allocation_repo: AllocationRepository

    def collect(
        self, asset_prices: pd.DataFrame
    ) -> tuple[list[Operation], list[Position], list[ParseFailure]]:
        # Passed to every loader uniformly; only RevolutLoader uses it.
        ticker_map = self.allocation_repo.load_ticker_data()

        all_operations: list[Operation] = []
        all_positions: list[Position] = []
        failures: list[ParseFailure] = []
        account_sources: dict[str, str] = {}

        for loader in self.loader_source.discover():
            try:
                operations, positions = loader.load(ticker_map, asset_prices)
            except ValueError as exc:
                print(f"[{loader.label}] ERROR: {exc}")
                failures.append(
                    ParseFailure(label=loader.label, message=str(exc))
                )
                continue

            loader_accounts = {
                account
                for item in [*operations, *positions]
                if (account := getattr(item, "account", None))
            }
            for account in sorted(loader_accounts):
                previous_source = account_sources.get(account)
                if previous_source is not None:
                    raise ValueError(
                        f"Account {account!r} is present in multiple sources: "
                        f"{previous_source!r} and {loader.label!r}"
                    )
                account_sources[account] = loader.label

            all_operations.extend(operations)
            all_positions.extend(positions)
            print(
                f"[{loader.label}] {len(operations)} operations,"
                f" {len(positions)} position rows"
            )

        return all_operations, all_positions, failures
