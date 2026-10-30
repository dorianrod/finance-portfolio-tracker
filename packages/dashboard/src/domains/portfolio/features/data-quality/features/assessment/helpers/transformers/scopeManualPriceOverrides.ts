import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

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

  // eslint-disable-next-line complexity -- reviewed: 2026-10-27; Date overlap and alternative asset identifiers define one manual-price visibility predicate.
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
