import { describe, expect, it } from 'vitest'

import { computePerformanceSummary } from '@/domains/portfolio/features/performance/helpers/transformers/performanceCalculations/computePerformanceSummary'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computePerformanceSummary', () => {
  it('computes net current value and total net performance', () => {
    const result = computePerformanceSummary([
      position({
        total_value: 1000,
        unrealized_gain: 100,
        unrealized_gain_net: 70,
        realized_gain: 50,
        realized_gain_net: 35,
        total_dividends: 20,
        total_dividends_net: 14,
        total_invested: 900,
      }),
    ])
    expect(result).toMatchObject({
      currentValueNet: 970,
      currentValueGross: 1000,
      unrealizedNet: 70,
      realizedNet: 35,
      realizedGross: 50,
      incomeNet: 14,
      totalPerformanceGross: 170,
      totalPerformanceNet: 119,
    })
  })
})
