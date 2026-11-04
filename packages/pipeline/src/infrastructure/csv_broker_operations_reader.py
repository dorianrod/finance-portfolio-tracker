"""Concrete BrokerOperationsReader: parses and merges broker exports.

No ticker_map enrichment, no position computation — just every operation,
for asset discovery and snapshot-date calculation.
"""

from dataclasses import dataclass
from datetime import date
from pathlib import Path

from src.domain.models import Operation
from src.domain.parsing.broker_exports import combine_operation_exports
from src.infrastructure.broker_file_discovery import (
    discover_prefixed_broker_groups,
)
from src.infrastructure.parsers.boursorama import (
    parse_operations as bourso_parse_ops,
)
from src.infrastructure.parsers.direct import (
    parse_operations as direct_parse_ops,
)
from src.infrastructure.parsers.revolut import (
    parse_operations as revolut_parse_ops,
)
from src.infrastructure.parsers.valuations import parse as valuations_parse
from src.ports.broker_operations import BrokerOperationsReader


@dataclass
class CsvBrokerOperationsReader(BrokerOperationsReader):
    input_dir: Path
    as_of: date | None = None

    def read_all(self) -> list[Operation]:
        exports: list[tuple[str, list[Operation]]] = []
        brokers_dir = self.input_dir / "brokers"

        for group in discover_prefixed_broker_groups(
            brokers_dir, "boursorama"
        ):
            for path in group.files:
                exports.append((
                    str(path), bourso_parse_ops(path, group.account)
                ))

        for group in discover_prefixed_broker_groups(brokers_dir, "revolut"):
            for csv_file in group.files:
                exports.append((
                    str(csv_file), revolut_parse_ops(csv_file, group.account)
                ))

        for direct_file in sorted(
            (self.input_dir / "brokers/direct").rglob("*.csv")
        ):
            exports.append((str(direct_file), direct_parse_ops(direct_file)))

        for val_file in sorted(
            (self.input_dir / "brokers/valuations").rglob("*.csv")
        ):
            operations, _ = valuations_parse(val_file, as_of=self.as_of)
            exports.append((str(val_file), operations))

        return [
            op for op in combine_operation_exports(exports)
            if self.as_of is None or op.date.date() <= self.as_of
        ]
