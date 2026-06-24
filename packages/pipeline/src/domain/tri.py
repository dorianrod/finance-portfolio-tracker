"""Global portfolio TRI (XIRR) computation."""

from datetime import date, datetime
from typing import cast

from src.domain.models import Operation, OperationType, Position


def _to_date(d: date | datetime) -> date:
    return d.date() if isinstance(d, datetime) else d


def _xirr(cashflows: list[tuple[float, date]]) -> float | None:
    """XIRR via Brent's method (scipy). cashflows = [(amount, date), ...]"""
    from scipy.optimize import brentq

    if len(cashflows) < 2:
        return None
    has_pos = any(a > 0 for a, _ in cashflows)
    has_neg = any(a < 0 for a, _ in cashflows)
    if not has_pos or not has_neg:
        return None

    t0 = cashflows[0][1]

    def npv(rate: float) -> float:
        return sum(
            a / (1 + rate) ** ((d - t0).days / 365.25) for a, d in cashflows
        )

    try:
        return cast(
            float, brentq(npv, -0.999, 100.0, xtol=1e-8, maxiter=500)
        )
    except (ValueError, RuntimeError):
        return None


def portfolio_xirr(
    operations: list[Operation],
    terminal_value: float,
    terminal_date: date,
) -> float | None:
    """Global portfolio XIRR from external cash flows only.

    Sign convention (investor's perspective):
    - DEPOSIT    → negative (money leaving investor's hands)
    - WITHDRAWAL → positive (money returned to investor)
    - terminal_value at terminal_date → positive (current market value)

    Dividends and interest are NOT counted separately: they are already
    reflected in total_value via reinvestment or cash positions.
    """
    flows: list[tuple[float, date]] = []
    for op in operations:
        if op.operation_type in (
            OperationType.DEPOSIT,
            OperationType.WITHDRAWAL,
        ):
            flows.append((-op.total_amount, _to_date(op.date)))

    if not flows:
        return None

    flows.append((terminal_value, terminal_date))
    flows.sort(key=lambda x: x[1])
    return _xirr(flows)


def monthly_tri_series(
    positions: list[Position],
    operations: list[Operation],
) -> dict[date, float | None]:
    """Cumulative TRI (annualised %) for each monthly snapshot date."""
    snap_dates = sorted({p.snapshot_date for p in positions})
    if not snap_dates:
        return {}

    value_by_date: dict[date, float] = {}
    for p in positions:
        d = _to_date(p.snapshot_date)
        value_by_date[d] = value_by_date.get(d, 0.0) + p.total_value

    ext_flows: list[tuple[float, date]] = []
    for op in operations:
        if op.operation_type in (
            OperationType.DEPOSIT,
            OperationType.WITHDRAWAL,
        ):
            ext_flows.append((-op.total_amount, _to_date(op.date)))
    ext_flows.sort(key=lambda x: x[1])

    result: dict[date, float | None] = {}
    for snap in snap_dates:
        snap_d = _to_date(snap)
        flows = [(a, d) for a, d in ext_flows if d <= snap_d]
        terminal = value_by_date.get(snap_d, 0.0)
        if terminal > 0:
            flows = flows + [(terminal, snap_d)]
        flows_sorted = sorted(flows, key=lambda x: x[1])
        tri = _xirr(flows_sorted)
        result[snap_d] = round(tri * 100, 2) if tri is not None else None

    return result
