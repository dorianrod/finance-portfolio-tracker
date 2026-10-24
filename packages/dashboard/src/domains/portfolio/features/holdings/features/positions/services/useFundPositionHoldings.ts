import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useFundHoldingsQuery'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import { holdingsForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

const EMPTY_FUND_HOLDINGS: FundHolding[] = []
const EMPTY_HISTORICAL_FUND_HOLDINGS: HistoricalFundHolding[] = []

export function useFundPositionHoldings(position: PositionRow) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { data: fundData } = useFundHoldingsQuery()
  return useMemo(() => {
    const holdings = filters.dateTo
      ? selectHistoricalFundHoldingsAtDate(
          fundData?.history ?? EMPTY_HISTORICAL_FUND_HOLDINGS,
          filters.dateTo,
        )
      : (fundData?.holdings ?? EMPTY_FUND_HOLDINGS)
    return holdingsForPosition(position, holdings)
      .toSorted((a, b) => b.weight - a.weight)
      .slice(0, 8)
  }, [filters.dateTo, fundData, position])
}
