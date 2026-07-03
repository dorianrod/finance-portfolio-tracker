import type { PositionRow } from '@/types/domain'
import type { Filters, SortKey } from '@/types/filters'
import type { PortfolioHistoryPoint, AccountTypePoint } from '@/types/history'
import type { RawPositionRow } from '@/hooks/useAllPositions'
import { accountFilterId } from '@/shared/filters/accountFilter'

export function getSortValue(row: PositionRow, key: SortKey): number {
  switch (key) {
    case 'total_value':           return row.total_value ?? 0
    case 'unrealized_gain':       return row.unrealized_gain ?? 0
    case 'realized_gain':         return row.realized_gain
    case 'total_realized_return': return row.total_realized_return
    case 'total_dividends':       return row.total_dividends + row.total_interest
    case 'total_return_pct':      return row.total_return_pct ?? 0
    case 'xirr':                  return row.xirr ?? 0
  }
}

// Applies the account/account-type/operation-type filters, and — when a
// date range is set — recomputes each position's period-scoped dividends,
// interest and realized gain from only the operations within that range
// (current value and unrealized gain stay as point-in-time snapshots).
export function applyPositionFilters(positions: PositionRow[], filters: Filters): PositionRow[] {
  const hasDateFilter = !!(filters.dateFrom || filters.dateTo)

  return positions
    .filter((p) => {
      if (filters.accountTypes.size > 0 && !filters.accountTypes.has(p.account_type ?? '')) return false
      if (filters.accounts.size > 0 && !filters.accounts.has(accountFilterId(p))) return false
      if (filters.operationTypes.size > 0) {
        const hasType = [...filters.operationTypes].some((t) => p.operationTypes.has(t))
        if (!hasType) return false
      }
      return true
    })
    .map((p) => {
      if (!hasDateFilter) return p

      const filteredSubRows = p.subRows
        .map((group) => {
          const ops = group.subRows.filter((op) => {
            if (filters.dateFrom && op.date < filters.dateFrom) return false
            if (filters.dateTo && op.date > filters.dateTo) return false
            return true
          })
          if (group.label === 'Dividends') {
            const total = ops.reduce((s, o) => s + o.total_amount, 0)
            return { ...group, subRows: ops, total_dividends: total, dividend_count: ops.length, annualized_dividends: undefined }
          }
          if (group.label === 'Interest') {
            const total = ops.reduce((s, o) => s + o.total_amount, 0)
            return { ...group, subRows: ops, total_interest: total, interest_count: ops.length }
          }
          // Buys / Sells
          const buyOps = ops.filter((o) => o.operation_type === 'BUY')
          const sellOps = ops.filter((o) => o.operation_type === 'SELL')
          return {
            ...group,
            subRows: ops,
            total_invested: buyOps.reduce((s, o) => s + Math.abs(o.total_amount), 0),
            total_sold: sellOps.reduce((s, o) => s + Math.abs(o.total_amount), 0),
            realized_pnl: sellOps.reduce((s, o) => s + (o.realized_gain ?? 0), 0),
            trade_count: ops.length,
          }
        })
        .filter((group) => group.subRows.length > 0)

      // Recompute period-scoped values from filtered ops
      const allOps = filteredSubRows.flatMap((g) => g.subRows)
      const realized_gain = allOps
        .filter((o) => o.operation_type === 'SELL')
        .reduce((s, o) => s + (o.realized_gain ?? 0), 0)
      const total_dividends = allOps
        .filter((o) => o.operation_type === 'DIVIDEND')
        .reduce((s, o) => s + o.total_amount, 0)
      const total_interest = allOps
        .filter((o) => o.operation_type === 'INTEREST')
        .reduce((s, o) => s + o.total_amount, 0)

      return {
        ...p,
        subRows: filteredSubRows,
        // total_value and unrealized_gain stay as snapshot values (independent of date filter)
        realized_gain,
        total_dividends,
        total_interest,
        total_realized_return: realized_gain + total_dividends + total_interest,
      }
    })
    .filter((p) => !hasDateFilter || p.subRows.length > 0)
}

// When an account filter is active, the portfolio-wide history series is
// replaced with one rebuilt from raw per-account position snapshots
// restricted to the selected accounts.
export function applyAccountFilterToHistory(
  allPositionRows: RawPositionRow[],
  enrichedHistory: PortfolioHistoryPoint[],
  accounts: Set<string>,
): PortfolioHistoryPoint[] {
  if (accounts.size === 0) return enrichedHistory

  const byDate = new Map<string, { tv: number; cb: number; ug: number }>()
  for (const p of allPositionRows) {
    if (!accounts.has(accountFilterId(p))) continue
    const tv = parseFloat(p.total_value) || 0
    const cb = (parseFloat(p.quantity) || 0) * (parseFloat(p.avg_buy_price) || 0)
    const ug = parseFloat(p.unrealized_gain) || 0
    const cur = byDate.get(p.snapshot_date) ?? { tv: 0, cb: 0, ug: 0 }
    byDate.set(p.snapshot_date, { tv: cur.tv + tv, cb: cur.cb + cb, ug: cur.ug + ug })
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { tv, cb, ug }]) => ({
      date,
      total_value: tv,
      total_cost_basis: Math.round(cb),
      unrealized_gain: Math.round(ug),
      net_cash_injected: 0,
      cash_delta: null,
      tri: null,
      total_broker_cash: 0,
    }))
}

export function buildAccountTypeBreakdown(filtered: PositionRow[]): AccountTypePoint[] {
  const map = new Map<string, { cost: number; gain: number }>()
  for (const p of filtered) {
    if (p.status !== 'active') continue
    const t = p.account_type ?? 'Other'
    const v = p.total_value ?? 0
    const g = p.unrealized_gain ?? 0
    const c = v - g
    const cur = map.get(t) ?? { cost: 0, gain: 0 }
    map.set(t, { cost: cur.cost + c, gain: cur.gain + g })
  }
  return [...map.entries()]
    .map(([account_type, { cost, gain }]) => ({
      account_type,
      total_cost_basis: Math.round(cost),
      unrealized_gain: Math.round(gain),
      total_value: Math.round(cost + gain),
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

export function sortPositionsForTable(
  filtered: PositionRow[],
  hideClosedPositions: boolean,
  allAccountTypes: string[],
  sortKey: SortKey,
  sortDir: 'asc' | 'desc',
): PositionRow[] {
  const rows = filtered.filter((p) => !hideClosedPositions || p.status !== 'closed')
  if (allAccountTypes.length === 0) return rows
  return [...rows].sort((a, b) => {
    const ta = a.account_type ?? ''
    const tb = b.account_type ?? ''
    if (ta !== tb) return ta.localeCompare(tb, 'en')
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const av = getSortValue(a, sortKey)
    const bv = getSortValue(b, sortKey)
    return sortDir === 'desc' ? bv - av : av - bv
  })
}
