import { useState } from 'react'

import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
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

  return (
    <OverviewConcentrationChartView
      presentation={presentation}
      displayedMode={displayedMode}
      lookThroughDisabled={lookThroughDisabled}
      description={description}
      onModeChange={setMode}
    >
      <ScopedInfoTooltip
        // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This chart chooses held versus underlying explanatory copy; ScopedInfoTooltip only renders it with live filter badges.
        text={description}
        // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This chart selects the concentration snapshot; ScopedInfoTooltip only adds live filter badges to the supplied reporting date.
        scope={{
          account: 'filterable',
          period: 'as-of',
          effectiveDate: concentration.current?.date,
        }}
      />
    </OverviewConcentrationChartView>
  )
}
