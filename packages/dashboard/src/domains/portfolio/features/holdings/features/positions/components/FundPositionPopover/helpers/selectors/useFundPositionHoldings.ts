import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { holdingsForPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/holdingsForPosition'
import { useGetFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/selectors/historicalFundHoldings/selectHistoricalFundHoldingsAtDate'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useFundPositionHoldings(position: PositionRow) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { data: fundData } = useGetFundHoldingsQuery()
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

const EMPTY_FUND_HOLDINGS: FundHolding[] = []
const EMPTY_HISTORICAL_FUND_HOLDINGS: HistoricalFundHolding[] = []
