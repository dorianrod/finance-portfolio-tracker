import { type ConcentrationChartRow } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/services/useConcentrationTrendController'
import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'

export type TrendTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: ConcentrationChartRow }>
}

export type HoldingTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HistoricalConcentrationHolding }>
}
