import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { PerformanceSummary } from './performanceCalculations.types'

export function computePerformanceSummary(
  positions: PositionRow[],
): PerformanceSummary {
  const active = positions.filter((position) => position.status === 'active')
  const currentValueGross = active.reduce(
    (sum, position) => sum + (position.total_value ?? 0),
    0,
  )
  const unrealizedGross = active.reduce(
    (sum, position) => sum + (position.unrealized_gain ?? 0),
    0,
  )
  const unrealizedNet = active.reduce(
    (sum, position) =>
      sum + (position.unrealized_gain_net ?? position.unrealized_gain ?? 0),
    0,
  )
  const currentCostBasis = currentValueGross - unrealizedGross
  const currentValueNet = currentCostBasis + unrealizedNet
  const realizedNet = positions.reduce(
    (sum, position) =>
      sum + (position.realized_gain_net ?? position.realized_gain),
    0,
  )
  const incomeNet = positions.reduce(
    (sum, position) =>
      sum +
      (position.total_dividends_net ?? position.total_dividends) +
      (position.total_interest_net ?? position.total_interest),
    0,
  )
  const realizedGross = positions.reduce(
    (sum, position) => sum + position.realized_gain,
    0,
  )
  const incomeGross = positions.reduce(
    (sum, position) => sum + position.total_dividends + position.total_interest,
    0,
  )
  const totalPerformanceGross = unrealizedGross + realizedGross + incomeGross
  const totalPerformanceNet = unrealizedNet + realizedNet + incomeNet
  const totalInvested = positions.reduce(
    (sum, position) => sum + position.total_invested,
    0,
  )

  return {
    currentValueNet: Math.round(currentValueNet),
    currentValueGross: Math.round(currentValueGross),
    unrealizedNet: Math.round(unrealizedNet),
    unrealizedGross: Math.round(unrealizedGross),
    realizedNet: Math.round(realizedNet),
    realizedGross: Math.round(realizedGross),
    incomeNet: Math.round(incomeNet),
    totalPerformanceGross: Math.round(totalPerformanceGross),
    totalPerformanceNet: Math.round(totalPerformanceNet),
    totalPerformancePct:
      totalInvested > 0 ? (totalPerformanceNet / totalInvested) * 100 : 0,
  }
}
