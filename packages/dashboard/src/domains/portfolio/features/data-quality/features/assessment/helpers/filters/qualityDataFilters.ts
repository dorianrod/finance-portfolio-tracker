import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
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

export function scopeManualPriceOverrides(
  overrides: ManualPriceOverride[],
  positions: PositionRow[],
  filters: DashboardFilters,
): ManualPriceOverride[] {
  const selectedIsins = new Set(
    positions.map((position) => position.isin).filter(Boolean),
  )
  const selectedTickers = new Set(
    positions.map((position) => position.ticker).filter(Boolean),
  )
  const selectedNames = new Set(
    positions.map((position) => position.name).filter(Boolean),
  )
  const hasAccountScope =
    filters.accounts.size > 0 || filters.accountTypes.size > 0

  return overrides.filter((override) => {
    if (
      filters.dateFrom &&
      override.date_to &&
      override.date_to < filters.dateFrom
    )
      return false
    if (
      filters.dateTo &&
      override.date_from &&
      override.date_from > filters.dateTo
    )
      return false
    if (!hasAccountScope) return true
    return (
      (!!override.isin && selectedIsins.has(override.isin)) ||
      (!!override.ticker && selectedTickers.has(override.ticker)) ||
      (!!override.name && selectedNames.has(override.name))
    )
  })
}

function errorMonth(date: Date | null): string | null {
  return date ? toCalendarMonth(date) : null
}
