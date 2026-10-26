import type {
  ComparedMetric,
  OverviewComparison,
} from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import {
  OverviewConcentrationChart,
  OverviewDriversChart,
  OverviewValueChart,
} from './OverviewCharts.feature'
import { OverviewSummaryCards } from './OverviewSummaryCards.feature'

type OverviewTabProps = {
  comparison: OverviewComparison | null
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
}

export function OverviewTab({
  comparison,
  rollingThreeYearTri,
  irrStatus,
}: OverviewTabProps) {
  if (!comparison) {
    return (
      <Surface variant="panel" align="center" className="mb-6 p-8">
        <Text as="h3" variant="bodyStrong" tone="secondary">
          {i18n.t('ui.overviewtab.overviewUnavailable')}
        </Text>
        <Text as="p" variant="body" tone="subtle" className="mt-2">
          {i18n.t(
            'ui.overviewtab.chooseAValidPeriodWithAvailablePortfolioHistory',
          )}
        </Text>
      </Surface>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      <OverviewSummaryCards
        comparison={comparison}
        heldConcentration={comparison.heldConcentration}
        underlyingConcentration={comparison.lookThroughConcentration}
        rollingThreeYearTri={rollingThreeYearTri}
        irrStatus={irrStatus}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OverviewValueChart comparison={comparison} />
        <OverviewDriversChart comparison={comparison} />
        <OverviewConcentrationChart
          heldConcentration={comparison.heldConcentration}
          underlyingConcentration={comparison.lookThroughConcentration}
        />
      </div>
    </div>
  )
}
