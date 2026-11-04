import { useState } from 'react'

import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import i18n from '@/i18n/i18n'

import { buildOverviewConcentrationRows } from './helpers/presenters/buildOverviewConcentrationRows'
import { OverviewConcentrationChartView } from './OverviewConcentrationChart.view'

export function OverviewConcentrationChart({
  heldConcentration,
  underlyingConcentration,
}: {
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
}) {
  const scopeContext = useFilterScopeContext()

  const [mode, setMode] = useState<ConcentrationMode>('lookThrough')
  const lookThroughDisabled = underlyingConcentration.current == null
  const displayedMode =
    mode === 'lookThrough' && lookThroughDisabled ? 'held' : mode
  const concentration =
    displayedMode === 'held' ? heldConcentration : underlyingConcentration
  const presentation = buildOverviewConcentrationRows(concentration)

  const description =
    displayedMode === 'lookThrough'
      ? i18n.t(
          'ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel',
        )
      : i18n.t(
          'ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers',
        )

  const scopeSpec: FilterScopeSpec = {
    account: 'filterable',
    period: 'as-of',
    effectiveDate: concentration.current?.date,
  }
  return (
    <OverviewConcentrationChartView
      presentation={presentation}
      displayedMode={displayedMode}
      lookThroughDisabled={lookThroughDisabled}
      description={description}
      onModeChange={setMode}
    >
      <InfoTooltip text={description}>
        <InfoTooltip.Footer>
          <FilterScopePresentation
            scope={scopeSpec}
            scopeContext={scopeContext}
          />
        </InfoTooltip.Footer>
      </InfoTooltip>
    </OverviewConcentrationChartView>
  )
}
