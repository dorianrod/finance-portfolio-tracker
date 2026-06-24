"""Concrete BrokerOperationsReader: parses every broker export as-is.

No ticker_map enrichment, no position computation — just every operation,
for asset discovery and snapshot-date calculation.
"""

from dataclasses import dataclass
from pathlib import Path

from src.domain.models import Operation
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

    def read_all(self) -> list[Operation]:
        all_ops: list[Operation] = []
        for account, path in [
            (
                "boursorama_pea",
                self.input_dir / "brokers/boursorama/PEA/operations.csv",
            ),
            (
                "boursorama_cto",
                self.input_dir / "brokers/boursorama/CTO/operations.csv",
            ),
        ]:
            if path.exists():
                all_ops.extend(bourso_parse_ops(path, account))

        revolut_path = next(
            self.input_dir.glob(
                "brokers/revolut/trading-account-statement_*.csv"
            ),
            None,
        )
        if revolut_path:
            all_ops.extend(revolut_parse_ops(revolut_path))

        for direct_file in sorted(
            (self.input_dir / "brokers/direct").rglob("*.csv")
        ):
            all_ops.extend(direct_parse_ops(direct_file))

        for val_file in sorted(
            (self.input_dir / "brokers/valuations").rglob("*.csv")
        ):
            operations, _ = valuations_parse(val_file)
            all_ops.extend(operations)

        return all_ops
