import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

export function scopePipelineErrors(
  errors: PipelineError[],
  positions: PositionRow[],
  filters: DashboardFilters,
): PipelineError[] {
  const selectedAccounts = new Set(
    positions.map((position) => position.account),
  )
  const selectedIsins = new Set(
    positions.map((position) => position.isin).filter(Boolean),
  )
  const selectedTickers = new Set(
    positions.map((position) => position.ticker).filter(Boolean),
  )
  const hasPositionScope =
    filters.accounts.size > 0 ||
    filters.accountTypes.size > 0 ||
    filters.operationTypes.size > 0

  // eslint-disable-next-line complexity -- Month, account and identifier precedence define one anomaly-scope predicate, including unattributable pipeline issues.
  return errors.filter((error) => {
    const month = errorMonth(error.date)
    if (month && filters.dateFrom && month < toCalendarMonth(filters.dateFrom))
      return false
    if (month && filters.dateTo && month > toCalendarMonth(filters.dateTo))
      return false

    if (!hasPositionScope) return true
    if (error.account) return selectedAccounts.has(error.account)
    if (error.isin) return selectedIsins.has(error.isin)
    if (error.ticker) return selectedTickers.has(error.ticker)

    // Pipeline-wide anomalies cannot be attributed more narrowly, so they
    // remain visible even when an account or position filter is active.
    return true
  })
}

function errorMonth(date: Date | null): string | null {
  return date ? toCalendarMonth(date) : null
}
