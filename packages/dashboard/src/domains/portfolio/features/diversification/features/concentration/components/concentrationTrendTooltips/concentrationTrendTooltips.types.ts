import { type ConcentrationChartRow } from '@/domains/portfolio/features/diversification/features/concentration/services/useConcentrationTrendController'
import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'

export type TrendTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: ConcentrationChartRow }>
}

export type HoldingTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HistoricalConcentrationHolding }>
}
