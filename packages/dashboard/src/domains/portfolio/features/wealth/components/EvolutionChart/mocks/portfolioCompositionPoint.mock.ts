import type { PortfolioCompositionPoint } from '@/domains/portfolio/features/wealth/components/EvolutionChart/types/portfolioCompositionPoint.type'

export function makePortfolioCompositionPoint(
  overrides: Partial<PortfolioCompositionPoint> = {},
): PortfolioCompositionPoint {
  return {
    date: new Date('2026-01-31'),
    composition: {
      cost: 80,
      gain: 20,
      total: 100,
      costShare: 80,
      gainShare: 20,
    },
    ...overrides,
  }
}
