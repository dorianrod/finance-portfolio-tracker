import { useIncomePlacementChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/services/useIncomePlacementChart'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import i18n from '@/i18n/i18n'

import { IncomePlacementRelationshipChartView } from './IncomePlacementRelationshipChart.view'

export function IncomePlacementRelationshipChart({
  data,
}: {
  data: AnnualIncomeSavingsPoint[]
}) {
  const model = useIncomePlacementChart(data)
  return (
    <IncomePlacementRelationshipChartView model={model}>
      <ScopedInfoTooltip
        text={i18n.t(
          'ui.incomeplacementrelationshipchart.relationshipBetweenAnnualDeclaredIncomeAndTheSharePlaced',
        )}
        scope={{ account: 'global', period: 'year-range' }}
      />
    </IncomePlacementRelationshipChartView>
  )
}
