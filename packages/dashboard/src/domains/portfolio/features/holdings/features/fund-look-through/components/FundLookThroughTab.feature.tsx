import { FundHoldingsExplorer } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/FundHoldingsExplorer.feature'
import { selectExposurePositions } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/selectors/selectExposurePositions'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'

import { FundExposureNotice } from './FundExposureNotice.view'

export function FundLookThroughTab({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const applicablePositions = selectExposurePositions(positions)

  let content = (
    <FundHoldingsExplorer positions={positions} holdings={holdings} />
  )
  if (applicablePositions.length === 0) {
    content = (
      <FundExposureNotice applicable={false}>
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.fundlookthroughtab.lookThroughAnalysisIsNotApplicableToSavingsChecking',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </FundExposureNotice>
    )
  }

  return <div className="mb-6 space-y-4">{content}</div>
}
