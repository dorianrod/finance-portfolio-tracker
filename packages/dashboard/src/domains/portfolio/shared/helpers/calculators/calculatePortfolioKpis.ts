import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function calculatePortfolioKpis(rows: PositionRow[]) {
  const activePositions = rows.filter((row) => row.status === 'active')
  const totalValue = activePositions.reduce(
    (sum, row) => sum + (row.total_value ?? 0),
    0,
  )
  const totalUnrealized = activePositions.reduce(
    (sum, row) => sum + (row.unrealized_gain ?? 0),
    0,
  )
  const totalUnrealizedNet = activePositions.reduce(
    (sum, row) => sum + (row.unrealized_gain_net ?? row.unrealized_gain ?? 0),
    0,
  )
  const totalInvested = activePositions.reduce(
    (sum, row) => sum + row.total_invested,
    0,
  )
  const totalCostBasis = totalValue - totalUnrealized

  return {
    activeCount: activePositions.length,
    closedCount: rows.length - activePositions.length,
    totalDividends: rows.reduce((sum, row) => sum + row.total_dividends, 0),
    totalInterest: rows.reduce((sum, row) => sum + row.total_interest, 0),
    totalRealized: rows.reduce((sum, row) => sum + row.realized_gain, 0),
    totalReturn: rows.reduce((sum, row) => sum + row.total_realized_return, 0),
    totalUnrealized,
    totalUnrealizedNet,
    totalValue,
    totalValueNet: totalCostBasis + totalUnrealizedNet,
    unrealizedPctGross:
      totalInvested > 0 ? (totalUnrealized / totalInvested) * 100 : 0,
    unrealizedPctNet:
      totalInvested > 0 ? (totalUnrealizedNet / totalInvested) * 100 : 0,
  }
}
