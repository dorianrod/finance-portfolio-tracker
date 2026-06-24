from datetime import date

from src.domain.models import (
    CashFlows,
    Operation,
    OperationType,
    PortfolioSnapshot,
    Position,
)


def cash_flow_analysis(operations: list[Operation]) -> CashFlows:
    """Compute cash-flow metrics from all operations.

    - total_deposited  : sum of DEPOSIT amounts (always positive)
    - total_withdrawn  : sum of WITHDRAWAL amounts (returned as positive)
    - net_cash_injected: total_deposited - total_withdrawn
    - total_dividends  : sum of DIVIDEND amounts
    - total_interest   : sum of INTEREST amounts
    """
    total_deposited = sum(
        op.total_amount
        for op in operations
        if op.operation_type == OperationType.DEPOSIT
    )
    total_withdrawn = sum(
        abs(op.total_amount)
        for op in operations
        if op.operation_type == OperationType.WITHDRAWAL
    )
    total_dividends = sum(
        op.total_amount
        for op in operations
        if op.operation_type == OperationType.DIVIDEND
    )
    total_interest = sum(
        op.total_amount
        for op in operations
        if op.operation_type == OperationType.INTEREST
    )

    return CashFlows(
        total_deposited=round(total_deposited, 2),
        total_withdrawn=round(total_withdrawn, 2),
        net_cash_injected=round(total_deposited - total_withdrawn, 2),
        total_dividends=round(total_dividends, 2),
        total_interest=round(total_interest, 2),
    )


def aggregate_positions(positions: list[Position]) -> list[Position]:
    """Merge positions across accounts for the same asset (matched by
    ISIN or ticker).

    Returns a new list with account set to "all" for merged entries.
    Single-account positions are returned unchanged.
    """
    grouped: dict[str, list[Position]] = {}
    for pos in positions:
        key = pos.isin or pos.ticker or pos.name
        grouped.setdefault(key, []).append(pos)

    aggregated: list[Position] = []
    for pos_list in grouped.values():
        if len(pos_list) == 1:
            aggregated.append(pos_list[0])
            continue

        total_qty = sum(p.quantity for p in pos_list)
        total_value = sum(p.total_value for p in pos_list)
        total_cost = sum(p.quantity * p.avg_buy_price for p in pos_list)
        avg_buy = total_cost / total_qty if total_qty > 0 else 0.0
        unrealized_gain = total_value - total_cost
        unrealized_gain_pct = (
            (unrealized_gain / total_cost * 100) if total_cost != 0 else 0.0
        )
        total_realized = sum(p.realized_gain for p in pos_list)

        aggregated.append(
            Position(
                snapshot_date=pos_list[0].snapshot_date,
                account="all",
                isin=pos_list[0].isin,
                ticker=pos_list[0].ticker,
                name=pos_list[0].name,
                quantity=total_qty,
                avg_buy_price=round(avg_buy, 6),
                last_price=pos_list[0].last_price,
                total_value=round(total_value, 2),
                unrealized_gain=round(unrealized_gain, 2),
                unrealized_gain_pct=round(unrealized_gain_pct, 2),
                realized_gain=round(total_realized, 2),
                currency=pos_list[0].currency,
            )
        )

    return aggregated


def gain_breakdown(
    positions: list[Position],
    cash_flows: CashFlows,
) -> dict[str, float]:
    """Break portfolio value into its components.

    Returns a dict with:
      net_cash_injected   — real money put in minus money taken out
      total_cost_basis    — sum of (qty * avg_buy_price) across positions
      current_value       — sum of (qty * last_price) across positions
      unrealized_gain     — current_value - total_cost_basis
      unrealized_gain_pct — unrealized_gain / total_cost_basis * 100
      total_dividends     — dividends received (cash, reinvested or not)
      total_interest      — interest received
    """
    total_cost_basis = sum(p.quantity * p.avg_buy_price for p in positions)
    current_value = sum(p.total_value for p in positions)
    unrealized_gain = current_value - total_cost_basis
    unrealized_gain_pct = (
        (unrealized_gain / total_cost_basis * 100)
        if total_cost_basis != 0
        else 0.0
    )

    return {
        "net_cash_injected": round(cash_flows.net_cash_injected, 2),
        "total_cost_basis": round(total_cost_basis, 2),
        "current_value": round(current_value, 2),
        "unrealized_gain": round(unrealized_gain, 2),
        "unrealized_gain_pct": round(unrealized_gain_pct, 2),
        "total_dividends": round(cash_flows.total_dividends, 2),
        "total_interest": round(cash_flows.total_interest, 2),
    }


def build_snapshot(
    positions: list[Position],
    operations: list[Operation],
    snapshot_date: date | None = None,
) -> PortfolioSnapshot:
    if snapshot_date is None:
        snapshot_date = date.today()

    total_value = sum(p.total_value for p in positions)
    total_cost_basis = sum(p.quantity * p.avg_buy_price for p in positions)
    unrealized_gain = total_value - total_cost_basis
    unrealized_gain_pct = (
        (unrealized_gain / total_cost_basis * 100)
        if total_cost_basis != 0
        else 0.0
    )

    return PortfolioSnapshot(
        snapshot_date=snapshot_date,
        total_value=round(total_value, 2),
        total_cost_basis=round(total_cost_basis, 2),
        unrealized_gain=round(unrealized_gain, 2),
        unrealized_gain_pct=round(unrealized_gain_pct, 2),
        cash_flows=cash_flow_analysis(operations),
    )
