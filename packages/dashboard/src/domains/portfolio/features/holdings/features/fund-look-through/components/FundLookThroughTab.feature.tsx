import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { FundHoldingsExplorer } from './FundHoldingsExplorer.feature'

export function FundLookThroughTab({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const applicablePositions = positions.filter(
    (position) =>
      position.status === 'active' &&
      (position.total_value ?? 0) > 0 &&
      isAssetAnalysisApplicablePosition(position),
  )

  let content = (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="flex items-center font-semibold text-content-secondary">
        {i18n.t('ui.fundlookthroughtab.noIdentifiedUnderlyingExposureYet')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </h2>
      <p className="mt-1 text-sm text-content-subtle">
        {i18n.t(
          'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
        )}
      </p>
    </section>
  )
  if (applicablePositions.length === 0) {
    content = (
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="flex items-center font-semibold text-content-secondary">
          {i18n.t('ui.fundlookthroughtab.underlyingExposureNotApplicable')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking',
            )}
            scope={{ account: 'filterable', period: 'as-of' }}
          />
        </h2>
        <p className="mt-1 text-sm text-content-subtle">
          {i18n.t('ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking')}
        </p>
      </section>
    )
  } else if (holdings.length > 0) {
    // eslint-disable-next-line local/no-prop-drilling -- Applicability filtering belongs to this tab-level orchestration feature.
    content = <FundHoldingsExplorer positions={applicablePositions} holdings={holdings} />
  }

  return <div className="mb-6 space-y-4">{content}</div>
}
