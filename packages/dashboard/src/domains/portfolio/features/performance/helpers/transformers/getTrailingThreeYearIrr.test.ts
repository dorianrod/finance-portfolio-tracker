import { describe, expect, it } from 'vitest'

import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

import { getTrailingThreeYearIrr } from './getTrailingThreeYearIrr'

describe('getTrailingThreeYearIrr', () => {
  it.each([0, -4.2, 8.5, null])(
    'uses the latest snapshot, including %s',
    (value) => {
      const history = [
        makePortfolioHistoryPoint({ tri_rolling_3y: 99 }),
        makePortfolioHistoryPoint({ tri_rolling_3y: value }),
      ]
      expect(getTrailingThreeYearIrr(history)).toBe(value)
      expect(history[0].tri_rolling_3y).toBe(99)
    },
  )
  it('has no return for empty history', () =>
    expect(getTrailingThreeYearIrr([])).toBeNull())
})
