import type { HoldingConcentration } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'

export function makeHoldingConcentration(
  overrides: Partial<HoldingConcentration> = {},
): HoldingConcentration {
  return { label: 'Small', name: 'Small', value: 20, weight: 20, ...overrides }
}
