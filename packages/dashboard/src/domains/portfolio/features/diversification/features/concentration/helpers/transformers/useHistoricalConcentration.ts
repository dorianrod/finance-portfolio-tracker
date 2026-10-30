import { useMemo } from 'react'

import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import { buildHistoricalConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalConcentration'
import { buildHistoricalLookThroughConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalLookThroughConcentration'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/transformers/filterPointsByPeriod'

export function useHistoricalConcentration({
  rawPositions,
  fundHoldingsHistory,
  accountFilters,
  accountTypeFilters,
  dateFrom,
  dateTo,
}: Pick<
  DiversificationInputs,
  | 'rawPositions'
  | 'fundHoldingsHistory'
  | 'accountFilters'
  | 'accountTypeFilters'
  | 'dateFrom'
  | 'dateTo'
>) {
  const heldPoints = useMemo(
    () =>
      filterPointsByPeriod(
        buildHistoricalConcentration(
          rawPositions,
          accountFilters,
          accountTypeFilters,
        ),
        dateFrom,
        dateTo,
      ),
    [rawPositions, accountFilters, accountTypeFilters, dateFrom, dateTo],
  )
  const lookThroughPoints = useMemo(
    () =>
      filterPointsByPeriod(
        buildHistoricalLookThroughConcentration(
          rawPositions,
          fundHoldingsHistory,
          accountFilters,
          accountTypeFilters,
        ),
        dateFrom,
        dateTo,
      ),
    [
      rawPositions,
      fundHoldingsHistory,
      accountFilters,
      accountTypeFilters,
      dateFrom,
      dateTo,
    ],
  )
  const lookThroughAvailable = fundHoldingsHistory.length > 0
  return useMemo(
    () => ({ heldPoints, lookThroughPoints, lookThroughAvailable }),
    [heldPoints, lookThroughPoints, lookThroughAvailable],
  )
}
