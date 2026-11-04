"""Combine broker exports, rejecting transactions repeated across sources."""

from collections.abc import Iterable
from math import isnan

from src.domain.errors import DuplicateBrokerOperationsError
from src.domain.models import Operation


def combine_operation_exports(
    exports: Iterable[tuple[str, list[Operation]]],
) -> list[Operation]:
    """Reject overlaps across files without discarding any operations.

    Repeated rows within one export can be separate legitimate trades.
    Cross-file matches instead require source cleanup before importing.
    Names may vary for the same ISIN; missing numbers compare equally
    across raw and consolidated formats.
    """
    seen: dict[tuple, str] = {}
    operations: list[Operation] = []
    conflicts: list[str] = []
    for source, source_operations in exports:
        current: dict[tuple, Operation] = {}
        for op in source_operations:
            key = (
                op.date,
                op.account,
                op.operation_type,
                op.isin or op.ticker or op.name,
                (
                    None if op.quantity is None or isnan(op.quantity)
                    else op.quantity
                ),
                (
                    None
                    if op.price_per_unit is None or isnan(op.price_per_unit)
                    else op.price_per_unit
                ),
                op.total_amount,
                op.currency,
            )
            current[key] = op
        for key, op in current.items():
            if key in seen:
                conflicts.append(
                    f"{seen[key]} <-> {source}: {op.account}, "
                    f"{op.date.isoformat()}, {op.operation_type}, "
                    f"{op.isin or op.ticker or op.name or 'cash'}, "
                    f"{op.total_amount:g} {op.currency}"
                )
            else:
                seen[key] = source
        operations.extend(source_operations)
    if conflicts:
        examples = "\n".join(f"  - {item}" for item in conflicts[:10])
        raise DuplicateBrokerOperationsError(
            f"{len(conflicts)} repeated operation(s) across broker exports. "
            "Remove superseded exports or correct overlapping rows, "
            f"then retry.\n{examples}"
        )
    return operations
