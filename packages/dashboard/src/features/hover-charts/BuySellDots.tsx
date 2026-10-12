import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BuySellDot(props: any) {
  const { cx, cy, payload } = props
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BuySellDotUnit(props: any) {
  const { cx, cy, payload } = props
  if (payload.hasBuy) return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionBuy} stroke={SEMANTIC_COLORS.transactionBuyStroke} strokeWidth={2} />
  if (payload.hasSell) return <circle cx={cx} cy={cy} r={5} fill={SEMANTIC_COLORS.transactionSell} stroke={SEMANTIC_COLORS.transactionSellStroke} strokeWidth={2} />
  return <g />
}
