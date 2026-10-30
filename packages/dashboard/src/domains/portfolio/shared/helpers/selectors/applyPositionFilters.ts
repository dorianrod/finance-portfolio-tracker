// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this common position snapshot and account scope to holdings, wealth, performance and quality. See SHARED_OWNERSHIP_AUDIT.md.
import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

// Applies the account/account-type/operation-type filters, and — when a
// date range is set — recomputes each position's period-scoped dividends,
// interest and realized gain from only the operations within that range
// (current value and unrealized gain stay as point-in-time snapshots).
export function applyPositionFilters(
  positions: PositionRow[],
  filters: DashboardFilters,
): PositionRow[] {
  const hasDateFilter = !!(filters.dateFrom || filters.dateTo)

  return (
    positions
      .filter((p) => {
        if (
          filters.accountTypes.size > 0 &&
          !filters.accountTypes.has(p.account_type ?? '')
        )
          return false
        if (
          filters.accounts.size > 0 &&
          !filters.accounts.has(accountFilterId(p))
        )
          return false
        if (filters.operationTypes.size > 0) {
          const hasType = [...filters.operationTypes].some((t) =>
            p.operationTypes.has(t),
          )
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
            if (group.groupType === 'dividends') {
              const total = ops.reduce((s, o) => s + o.total_amount, 0)
              return {
                ...group,
                subRows: ops,
                total_dividends: total,
                dividend_count: ops.length,
                annualized_dividends: undefined,
              }
            }
            if (group.groupType === 'interest') {
              const total = ops.reduce((s, o) => s + o.total_amount, 0)
              return {
                ...group,
                subRows: ops,
                total_interest: total,
                interest_count: ops.length,
              }
            }
            if (group.groupType === 'cash') {
              return {
                ...group,
                subRows: ops,
                deposit_total: ops
                  .filter((operation) => operation.operation_type === 'DEPOSIT')
                  .reduce(
                    (sum, operation) => sum + Math.abs(operation.total_amount),
                    0,
                  ),
                withdrawal_total: ops
                  .filter(
                    (operation) => operation.operation_type === 'WITHDRAWAL',
                  )
                  .reduce(
                    (sum, operation) => sum + Math.abs(operation.total_amount),
                    0,
                  ),
              }
            }
            // Trade groups use period-specific invested, sold and realized amounts.
            const buyOps = ops.filter((o) => o.operation_type === 'BUY')
            const sellOps = ops.filter((o) => o.operation_type === 'SELL')
            return {
              ...group,
              subRows: ops,
              total_invested: buyOps.reduce(
                (s, o) => s + Math.abs(o.total_amount),
                0,
              ),
              total_sold: sellOps.reduce(
                (s, o) => s + Math.abs(o.total_amount),
                0,
              ),
              realized_pnl: sellOps.reduce(
                (s, o) => s + (o.realized_gain ?? 0),
                0,
              ),
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
        const netRatio = (net: number | null, gross: number) =>
          net != null && Math.abs(gross) > 0.005
            ? net / gross
            : 1 - (p.tax_rate ?? 0)

        return {
          ...p,
          subRows: filteredSubRows,
          // total_value and unrealized_gain stay as snapshot values (independent of date filter)
          realized_gain,
          realized_gain_net:
            realized_gain * netRatio(p.realized_gain_net, p.realized_gain),
          total_dividends,
          total_dividends_net:
            total_dividends *
            netRatio(p.total_dividends_net, p.total_dividends),
          total_interest,
          total_interest_net:
            total_interest * netRatio(p.total_interest_net, p.total_interest),
          total_realized_return:
            realized_gain + total_dividends + total_interest,
        }
      })
      // A held position remains visible at the selected end snapshot even when
      // it had no operation during the interval. Closed positions are retained
      // only when they contain an operation in the selected interval.
      .filter(
        (p) => !hasDateFilter || p.status === 'active' || p.subRows.length > 0,
      )
  )
}
