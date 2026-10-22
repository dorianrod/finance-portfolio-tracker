"""File-system-backed discovery of concrete broker loaders."""

from dataclasses import dataclass
from pathlib import Path

from src.infrastructure.broker_file_discovery import (
    discover_prefixed_broker_groups,
)
from src.infrastructure.parsers.boursorama import BoursoramaLoader
from src.infrastructure.parsers.direct import DirectLoader
from src.infrastructure.parsers.revolut import RevolutLoader
from src.infrastructure.parsers.valuations import ValuationsLoader
from src.ports.parsers import BrokerLoader, BrokerLoaderSource


@dataclass
class FileBrokerLoaderSource(BrokerLoaderSource):
    """Build loaders from the conventional folders below ``input/``."""

    input_dir: Path

    def discover(self) -> list[BrokerLoader]:
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

        for direct_file in sorted((brokers_dir / "direct").rglob("*.csv")):
            loaders.append(DirectLoader(direct_file))

        for valuation_file in sorted(
            (brokers_dir / "valuations").rglob("*.csv")
        ):
            loaders.append(ValuationsLoader(valuation_file))

        return loaders
