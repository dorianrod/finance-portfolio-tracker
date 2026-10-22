import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import type { HoverChartDataPoint } from './hoverCharts.logic'

interface BuySellDotProps {
  cx?: number
  cy?: number
  payload?: HoverChartDataPoint
}

export function BuySellDot({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy && payload.hasSell) {
    return <circle cx={cx} cy={cy} r={6} fill={SEMANTIC_COLORS.transactionMixed} stroke={SEMANTIC_COLORS.transactionMixedStroke} strokeWidth={2} />
  }
  if (payload.hasBuy) {
    return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionBuy} stroke={SEMANTIC_COLORS.transactionBuyStroke} strokeWidth={2} />
  }
  if (payload.hasSell) {
    return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionSell} stroke={SEMANTIC_COLORS.transactionSellStroke} strokeWidth={2} />
  }
  return <g />
}

export function BuySellDotUnit({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy) return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionBuy} stroke={SEMANTIC_COLORS.transactionBuyStroke} strokeWidth={2} />
  if (payload.hasSell) return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionSell} stroke={SEMANTIC_COLORS.transactionSellStroke} strokeWidth={2} />
  return <g />
}
