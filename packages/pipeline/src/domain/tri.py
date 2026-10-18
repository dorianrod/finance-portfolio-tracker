"""Global portfolio TRI (XIRR) computation."""

from datetime import date, datetime, timedelta
from typing import cast

from src.domain.models import Operation, OperationType, Position

AccountOpeningValues = dict[str, tuple[date, float]]


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
    opening_value: float | None = None,
    opening_date: date | None = None,
    opening_values_by_account: AccountOpeningValues | None = None,
) -> float | None:
    """Portfolio XIRR from the beginning of the available valuation history.

    Sign convention (investor's perspective):
    - opening_value → negative (capital already invested at the boundary)
    - DEPOSIT    → negative (money leaving investor's hands)
    - WITHDRAWAL → positive (money returned to investor)
    - terminal_value at terminal_date → positive (current market value)

    Opening valuations can be supplied per account. Each is used only when
    that account has no recorded external flow on or before its first
    snapshot. This avoids both omitting an account with no initial deposit and
    double-counting an account whose initial deposit is already recorded.

    The aggregate opening_value/opening_date arguments remain available for
    callers that do not have account-level position history.

    Dividends and interest are NOT counted separately: they are already
    reflected in total_value via reinvestment or cash positions.
    """
    external_flows: list[tuple[float, date, str]] = []
    for op in operations:
        if op.operation_type in (
            OperationType.DEPOSIT,
            OperationType.WITHDRAWAL,
        ):
            op_date = _to_date(op.date)
            if op_date <= terminal_date:
                external_flows.append((-op.total_amount, op_date, op.account))

    if opening_values_by_account is not None:
        flows = [
            (amount, flow_date) for amount, flow_date, _ in external_flows
        ]
        for account, (account_opening_date, account_opening_value) in (
            opening_values_by_account.items()
        ):
            if (
                account_opening_date > terminal_date
                or account_opening_value <= 0
            ):
                continue
            has_flow_by_opening = any(
                flow_account == account and flow_date <= account_opening_date
                for _, flow_date, flow_account in external_flows
            )
            if not has_flow_by_opening:
                flows.append((-account_opening_value, account_opening_date))

        if not flows:
            return None
        flows.append((terminal_value, terminal_date))
        flows.sort(key=lambda x: x[1])
        return _xirr(flows)

    has_flow_by_opening = opening_date is not None and any(
        flow_date <= opening_date for _, flow_date, _ in external_flows
    )
    use_opening_value = (
        opening_date is not None
        and opening_value is not None
        and opening_value > 0
        and not has_flow_by_opening
    )

    flows: list[tuple[float, date]] = []
    if use_opening_value:
        assert opening_date is not None
        assert opening_value is not None
        flows.append((-opening_value, opening_date))
        flows.extend(
            (amount, flow_date)
            for amount, flow_date, _ in external_flows
            if flow_date > opening_date
        )
    else:
        flows.extend(
            (amount, flow_date) for amount, flow_date, _ in external_flows
        )

    if not flows:
        return None

    flows.append((terminal_value, terminal_date))
    flows.sort(key=lambda x: x[1])
    return _xirr(flows)


def portfolio_opening_valuation(
    positions: list[Position],
) -> tuple[date, float] | None:
    """Return the earliest snapshot date and its aggregate market value."""
    if not positions:
        return None
    opening_date = min(
        _to_date(position.snapshot_date) for position in positions
    )
    opening_value = sum(
        position.total_value
        for position in positions
        if _to_date(position.snapshot_date) == opening_date
    )
    return opening_date, opening_value


def portfolio_opening_valuations(
    positions: list[Position],
) -> AccountOpeningValues:
    """Return each account's value at its own first available snapshot."""
    opening_dates: dict[str, date] = {}
    for position in positions:
        snapshot_date = _to_date(position.snapshot_date)
        current = opening_dates.get(position.account)
        if current is None or snapshot_date < current:
            opening_dates[position.account] = snapshot_date

    opening_values: AccountOpeningValues = {}
    for account, opening_date in opening_dates.items():
        opening_values[account] = (
            opening_date,
            sum(
                position.total_value
                for position in positions
                if position.account == account
                and _to_date(position.snapshot_date) == opening_date
            ),
        )
    return opening_values


def _portfolio_investor_flows(
    positions: list[Position], operations: list[Operation]
) -> list[tuple[float, date]]:
    """External flows plus account openings not covered by such a flow."""
    external_flows = [
        (-op.total_amount, _to_date(op.date), op.account)
        for op in operations
        if op.operation_type
        in (OperationType.DEPOSIT, OperationType.WITHDRAWAL)
    ]
    flows = [(amount, flow_date) for amount, flow_date, _ in external_flows]

    for account, (opening_date, opening_value) in portfolio_opening_valuations(
        positions
    ).items():
        has_flow_by_opening = any(
            flow_account == account and flow_date <= opening_date
            for _, flow_date, flow_account in external_flows
        )
        if opening_value > 0 and not has_flow_by_opening:
            flows.append((-opening_value, opening_date))

    return sorted(flows, key=lambda x: x[1])


def monthly_tri_series(
    positions: list[Position],
    operations: list[Operation],
) -> dict[date, float | None]:
    """Cumulative TRI (annualised %) for each monthly snapshot date."""
    snap_dates = sorted({_to_date(p.snapshot_date) for p in positions})
    if not snap_dates:
        return {}

    value_by_date: dict[date, float] = {}
    for p in positions:
        d = _to_date(p.snapshot_date)
        value_by_date[d] = value_by_date.get(d, 0.0) + p.total_value

    opening_values = portfolio_opening_valuations(positions)
    result: dict[date, float | None] = {}
    for snap in snap_dates:
        if snap == snap_dates[0]:
            result[snap] = None
            continue
        tri = portfolio_xirr(
            operations,
            terminal_value=value_by_date.get(snap, 0.0),
            terminal_date=snap,
            opening_values_by_account=opening_values,
        )
        result[snap] = round(tri * 100, 2) if tri is not None else None

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

    investor_flows = _portfolio_investor_flows(positions, operations)
    first_snapshot_date = snap_dates[0]
    window = timedelta(days=round(window_years * 365.25))

    result: dict[date, float | None] = {}
    for snap in snap_dates:
        if snap - first_snapshot_date < window:
            result[snap] = None
            continue

        window_start = snap - window
        prior_snaps = [d for d in snap_dates if d <= window_start]
        if not prior_snaps:
            result[snap] = None
            continue
        start_snap = max(prior_snaps)
        start_value = value_by_date.get(start_snap, 0.0)

        flows = [
            (amount, flow_date)
            for amount, flow_date in investor_flows
            if start_snap < flow_date <= snap
        ]
        if start_value > 0:
            flows.append((-start_value, start_snap))
        terminal = value_by_date.get(snap, 0.0)
        if terminal > 0:
            flows.append((terminal, snap))

        flows_sorted = sorted(flows, key=lambda x: x[1])
        tri = _xirr(flows_sorted)
        result[snap] = round(tri * 100, 2) if tri is not None else None

    return result
