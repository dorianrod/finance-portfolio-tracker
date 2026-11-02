import { describe, expect, it } from 'vitest'

import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

import { computePortfolioComposition } from './computePortfolioComposition'

describe('computePortfolioComposition', () => {
  it.each([
    {
      name: 'positive attribution',
      point: makePortfolioHistoryPoint(),
      expected: {
        cost: 80,
        gain: 20,
        total: 100,
        costShare: 80,
        gainShare: 20,
      },
    },
    {
      name: 'a loss exceeding its share of the current value',
      point: makePortfolioHistoryPoint({
        total_cost_basis: 125,
        unrealized_gain: -25,
      }),
      expected: {
        cost: 125,
        gain: -25,
        total: 100,
        costShare: 125,
        gainShare: -25,
      },
    },
    {
      name: 'canceling cost and loss',
      point: makePortfolioHistoryPoint({
        total_cost_basis: 100,
        unrealized_gain: -100,
      }),
      expected: {
        cost: 100,
        gain: -100,
        total: 0,
        costShare: null,
        gainShare: null,
      },
    },
    {
      name: 'a missing observation',
      point: undefined,
      expected: {
        cost: 0,
        gain: 0,
        total: 0,
        costShare: null,
        gainShare: null,
      },
    },
  ])('preserves $name', ({ point, expected }) => {
    expect(computePortfolioComposition(point)).toEqual(expected)
  })
})
