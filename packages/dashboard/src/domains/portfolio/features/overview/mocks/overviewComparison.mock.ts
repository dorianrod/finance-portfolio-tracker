import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { metric } from '@/domains/portfolio/features/overview/mocks/comparedMetric.mock'

export function comparison(): OverviewComparison {
  const concentration = {
    current: {
      date: new Date('2026-10-20'),
      topHoldingPct: 24,
      topFivePct: 62,
      coveragePct: 88,
      holdings: [
        { key: 'A', label: 'AAA', name: 'Asset A', value: 240, weight: 24 },
      ],
    },
    previous: {
      date: new Date('2025-10-20'),
      topHoldingPct: 26,
      topFivePct: 65,
      coveragePct: 86,
      holdings: [
        { key: 'A', label: 'AAA', name: 'Asset A', value: 260, weight: 26 },
      ],
    },
    topHolding: metric(24, 26),
    topFive: metric(62, 65),
  }
  return {
    windows: {
      current: { start: new Date('2025-10-21'), end: new Date('2026-10-20') },
      previous: { start: new Date('2024-10-21'), end: new Date('2025-10-20') },
      defaultedToTrailingYear: true,
    },
    value: metric(120_000, 100_000),
    netValue: 117_000,
    contributions: metric(15_000, 12_000),
    marketPerformance: metric(5_000, 3_000),
    passiveIncome: metric(800, 650),
    valueHistory: [],
    heldConcentration: concentration,
    lookThroughConcentration: concentration,
  }
}
