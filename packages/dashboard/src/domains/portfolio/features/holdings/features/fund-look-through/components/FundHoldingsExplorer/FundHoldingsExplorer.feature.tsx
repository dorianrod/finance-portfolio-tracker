import { FundExposureNotice } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundExposureNotice.view'
import { useFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useFundExposureViewModel'
import { useVirtualExposureList } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useVirtualExposureList'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'

import { FundHoldingsExplorerView } from './FundHoldingsExplorer.view'

export function FundHoldingsExplorer({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const model = useFundExposureViewModel(positions, holdings)
  const list = useVirtualExposureList(model.rows)
  if (model.totalIssuerCount === 0)
    return (
      <FundExposureNotice applicable>
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.fundlookthroughtab.unresolvedCompositePositionsRemainListedWithTheirMonetaryImpact',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </FundExposureNotice>
    )
  return (
    <FundHoldingsExplorerView model={model} list={list}>
      <ScopedInfoTooltip
        text={i18n.t(
          'ui.fundholdingsexplorer.underlyingHoldingsGroupedByIssuerWithSecurityAndSource',
        )}
        scope={{ account: 'filterable', period: 'as-of' }}
      />
    </FundHoldingsExplorerView>
  )
}

export type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/fundExposureSort.type'
