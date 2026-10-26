import type {
  ComparedMetric,
  OverviewComparison,
} from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { OverviewConcentrationChart } from '@/domains/portfolio/features/overview/pages/overviewCharts/OverviewConcentrationChart.feature'
import { OverviewDriversChart } from '@/domains/portfolio/features/overview/pages/overviewCharts/OverviewDriversChart.feature'
import { OverviewValueChart } from '@/domains/portfolio/features/overview/pages/overviewCharts/OverviewValueChart.feature'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { OverviewSummaryCards } from './OverviewSummaryCards.feature'

export function OverviewTab({
  comparison,
  rollingThreeYearTri,
  irrStatus,
}: OverviewTabProps) {
  if (!comparison) {
    return (
      <div className="mb-6">
        <Surface variant="panel" align="center">
          <Text as="h3" variant="bodyStrong" tone="secondary">
            {i18n.t('ui.overviewtab.overviewUnavailable')}
          </Text>
          <Layout spaceBefore="default">
            <Text as="p" variant="body" tone="subtle">
              {i18n.t(
                'ui.overviewtab.chooseAValidPeriodWithAvailablePortfolioHistory',
              )}
            </Text>
          </Layout>
        </Surface>
      </div>
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

type OverviewTabProps = {
  comparison: OverviewComparison | null
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
}
