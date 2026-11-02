import { type ReactNode, useMemo } from 'react'

import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { EvolutionChartView } from './EvolutionChart.view'
import { buildPortfolioCompositionHistory } from './helpers/transformers/buildPortfolioCompositionHistory'

/*
 * @architecture-decision prepared-evolution-metrics
 * @rules arch-component-roles, helpers-categories
 * @choice Prepare monetary totals and attribution here, then supply chart and tooltip data to the view.
 * @reason The chart and tooltip render the same reporting metrics without owning their calculation.
 * @alternative Preparing these values in WealthTab couples the page to this chart's reporting contract.
 * @revisit Reporting scope or composition policy acquires a lifecycle independent of this chart.
 */
export function EvolutionChart({
  history,
  children,
  title,
  height,
}: {
  history: PortfolioHistoryPoint[]
  children: ReactNode
  title?: string
  height?: number
}) {
  const preparedHistory = useMemo(
    () => buildPortfolioCompositionHistory(history),
    [history],
  )
  return (
    <EvolutionChartView history={preparedHistory} title={title} height={height}>
      {children}
    </EvolutionChartView>
  )
}
