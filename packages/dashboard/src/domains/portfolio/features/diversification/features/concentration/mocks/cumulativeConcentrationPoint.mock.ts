import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/types/cumulativeConcentrationPoint.type'

export function makeCumulativeConcentrationPoint(
  overrides: Partial<CumulativeConcentrationPoint> = {},
): CumulativeConcentrationPoint {
  return {
    rank: 7,
    label: 'Example asset',
    name: 'Example asset',
    value: 12_500,
    weight: 4.25,
    cumulativeWeight: 70.5,
    ...overrides,
  }
}
