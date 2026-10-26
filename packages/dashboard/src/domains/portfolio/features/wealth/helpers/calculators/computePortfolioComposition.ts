import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function computePortfolioComposition(
  point: CompositionInput | undefined,
) {
  const cost = point?.total_cost_basis ?? 0
  const gain = point?.unrealized_gain ?? 0
  const total = cost + gain
  return {
    cost,
    gain,
    total,
    costShare: total === 0 ? null : (cost / total) * 100,
    gainShare: total === 0 ? null : (gain / total) * 100,
  }
}

type CompositionInput = Pick<
  PortfolioHistoryPoint,
  'total_cost_basis' | 'unrealized_gain'
>
