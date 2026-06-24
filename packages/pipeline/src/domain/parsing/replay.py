"""Generic BUY/SELL replay engine shared by the statement parsers.

boursorama.py, revolut.py and the unit-based branch of direct.py all
replay BUY/SELL operations the same way: accumulate quantity and cost
basis, and on each SELL compute a realized gain proportional to the
fraction of the position being sold. `key_fn` is how each caller keeps
its own grouping (by ISIN, by ticker, or a single fixed key when the
caller has already grouped operations upstream).
"""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import date

from src.domain.models import Operation, OperationType


@dataclass
class ReplayResult:
    quantity: float = 0.0
    total_cost: float = 0.0
    realized_gain: float = 0.0
    name: str | None = None


def annotate_realized_gains(
    trade_ops: list[Operation],
    key_fn: Callable[[Operation], str],
) -> None:
    """Mutate op.realized_gain in place on each SELL in trade_ops.

    trade_ops must be sorted by date and contain only BUY/SELL operations.
    """
    qty: dict[str, float] = {}
    cost: dict[str, float] = {}
    for op in trade_ops:
        key = key_fn(op)
        q = op.quantity or 0.0
        if op.operation_type == OperationType.BUY:
            c = (
                (op.price_per_unit * q)
                if op.price_per_unit and q
                else abs(op.total_amount)
            )
            qty[key] = qty.get(key, 0.0) + q
            cost[key] = cost.get(key, 0.0) + c
        elif op.operation_type == OperationType.SELL:
            current_qty = qty.get(key, 0.0)
            if current_qty > 0:
                sell_ratio = min(q / current_qty, 1.0)
                cost_of_sold = cost.get(key, 0.0) * sell_ratio
                op.realized_gain = round(
                    abs(op.total_amount) - cost_of_sold, 2
                )
                cost[key] = cost.get(key, 0.0) * (1.0 - sell_ratio)
            qty[key] = max(0.0, current_qty - q)


def replay_holdings(
    trade_ops: list[Operation],
    snap_date: date,
    key_fn: Callable[[Operation], str],
) -> dict[str, ReplayResult]:
    """Replay BUY/SELL ops up to and including snap_date, grouped by key_fn.

    trade_ops must be sorted by date. Call annotate_realized_gains() first
    so SELL ops already carry their realized_gain.
    """
    holdings: dict[str, ReplayResult] = {}
    for op in trade_ops:
        if op.date.date() > snap_date:
            break
        key = key_fn(op)
        h = holdings.setdefault(key, ReplayResult())
        if op.name:
            h.name = op.name

        q = op.quantity or 0.0
        if op.operation_type == OperationType.BUY:
            cost = (
                (op.price_per_unit * q)
                if op.price_per_unit and q
                else abs(op.total_amount)
            )
            h.quantity += q
            h.total_cost += cost
        elif op.operation_type == OperationType.SELL:
            if h.quantity > 0:
                sell_ratio = min(q / h.quantity, 1.0)
                h.total_cost *= 1.0 - sell_ratio
            h.quantity = max(0.0, h.quantity - q)
            if op.realized_gain is not None:
                h.realized_gain += op.realized_gain

    return holdings
