import type {
  ComparedMetric,
  OverviewComparison,
} from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
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

export function OverviewTab({ comparison, rollingThreeYearTri, irrStatus }: OverviewTabProps) {
  if (!comparison) {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-surface p-8 text-center">
        <h3 className="text-sm font-semibold text-content-secondary">
          {i18n.t('ui.overviewtab.overviewUnavailable')}
        </h3>
        <p className="mt-2 text-sm text-content-subtle">
          {i18n.t('ui.overviewtab.chooseAValidPeriodWithAvailablePortfolioHistory')}
        </p>
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
