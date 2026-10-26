import { useHistoricalConcentration } from '@/domains/portfolio/features/diversification/features/concentration/services/useHistoricalConcentration'
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'

import { ConcentrationTrendSection } from './ConcentrationTrendSection.feature'

export function HistoricalConcentration(
  inputs: Pick<
    DiversificationInputs,
    | 'rawPositions'
    | 'fundHoldingsHistory'
    | 'accountFilters'
    | 'accountTypeFilters'
    | 'dateFrom'
    | 'dateTo'
  >,
) {
  const { heldPoints, lookThroughPoints, lookThroughAvailable } =
    useHistoricalConcentration(inputs)
  return (
    <ConcentrationTrendSection
      heldPoints={heldPoints}
      lookThroughPoints={lookThroughPoints}
      lookThroughAvailable={lookThroughAvailable}
    />
  )
}
