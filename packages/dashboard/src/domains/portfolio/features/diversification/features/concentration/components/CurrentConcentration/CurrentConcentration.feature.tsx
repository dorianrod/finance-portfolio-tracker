import { useCurrentConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/useCurrentConcentration'
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'

import { CurrentConcentrationView } from './CurrentConcentration.view'
import { useConcentrationDescriptions } from './helpers/presenters/useConcentrationDescriptions'

export function CurrentConcentration({
  positions,
  fundHoldings,
  dateTo,
  concentrationMode,
  onModeChange,
}: Pick<DiversificationInputs, 'positions' | 'fundHoldings' | 'dateTo'> & {
  concentrationMode: ConcentrationMode
  onModeChange: (mode: ConcentrationMode) => void
}) {
  const {
    heldAssetConcentration,
    lookThroughConcentration,
    concentration,
    cumulativeConcentration,
  } = useCurrentConcentration(positions, fundHoldings, concentrationMode)
  const hasConcentrationData =
    heldAssetConcentration.allHoldings.length > 0 ||
    lookThroughConcentration.allHoldings.length > 0
  const { cumulativeDescription, holdingsDescription } =
    useConcentrationDescriptions(concentration, concentrationMode)
  return (
    <CurrentConcentrationView
      visible={hasConcentrationData}
      concentration={concentration}
      cumulativeConcentration={cumulativeConcentration}
      concentrationMode={concentrationMode}
      onModeChange={onModeChange}
      cumulativeDescription={cumulativeDescription}
      holdingsDescription={holdingsDescription}
    >
      <FilterScopeBadges
        account="filterable"
        period="as-of"
        effectiveDate={dateTo}
      />
    </CurrentConcentrationView>
  )
}
