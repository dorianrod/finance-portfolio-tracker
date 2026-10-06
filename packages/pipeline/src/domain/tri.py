"""Global portfolio TRI (XIRR) computation."""

from datetime import date, datetime, timedelta
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


def rolling_tri_series(
    positions: list[Position],
    operations: list[Operation],
    window_years: float = 3.0,
) -> dict[date, float | None]:
    """Trailing N-year annualised TRI for each monthly snapshot date.

    Unlike monthly_tri_series (since-inception), this treats the portfolio's
    value at the start of a fixed-length trailing window as a synthetic
    outflow, so each point measures performance over a roughly constant
    span. A since-inception XIRR evaluated shortly after the first deposit
    annualises a tiny elapsed time and explodes to meaningless magnitudes
    (e.g. a few % real gain over one month implies thousands of % per
    year); a trailing window never has that short-elapsed-time problem once
    it's full, so snapshots before a full window has elapsed return None
    rather than show that same explosion.
    """
    snap_dates = sorted({_to_date(p.snapshot_date) for p in positions})
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

    if not ext_flows:
        return {snap: None for snap in snap_dates}

    first_flow_date = ext_flows[0][1]
    window = timedelta(days=round(window_years * 365.25))

    result: dict[date, float | None] = {}
    for snap in snap_dates:
        if snap - first_flow_date < window:
            result[snap] = None
            continue

        window_start = snap - window
        prior_snaps = [d for d in snap_dates if d <= window_start]
        if not prior_snaps:
            result[snap] = None
            continue
        start_snap = max(prior_snaps)
        start_value = value_by_date.get(start_snap, 0.0)

        flows = [(a, d) for a, d in ext_flows if start_snap < d <= snap]
        if start_value > 0:
            flows.append((-start_value, start_snap))
        terminal = value_by_date.get(snap, 0.0)
        if terminal > 0:
            flows.append((terminal, snap))

        flows_sorted = sorted(flows, key=lambda x: x[1])
        tri = _xirr(flows_sorted)
        result[snap] = round(tri * 100, 2) if tri is not None else None

    return result
