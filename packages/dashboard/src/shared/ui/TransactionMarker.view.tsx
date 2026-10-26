import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

type Kind = 'buy' | 'sell' | 'mixed'
const TOKENS = {
  buy: {
    fill: SEMANTIC_COLORS.transactionBuy,
    stroke: SEMANTIC_COLORS.transactionBuyStroke,
    r: 5,
  },
  sell: {
    fill: SEMANTIC_COLORS.transactionSell,
    stroke: SEMANTIC_COLORS.transactionSellStroke,
    r: 5,
  },
  mixed: {
    fill: SEMANTIC_COLORS.transactionMixed,
    stroke: SEMANTIC_COLORS.transactionMixedStroke,
    r: 6,
  },
} as const
export function TransactionMarker({
  cx,
  cy,
  kind,
}: {
  cx?: number
  cy?: number
  kind: Kind
}) {
  return <circle cx={cx} cy={cy} {...TOKENS[kind]} strokeWidth={2} />
}
