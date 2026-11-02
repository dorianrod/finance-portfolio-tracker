import { describe, expect, it } from 'vitest'

import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

import { buildPortfolioCompositionHistory } from './buildPortfolioCompositionHistory'

describe('buildPortfolioCompositionHistory', () => {
  it('supplies dated reporting metrics without changing source observations', () => {
    const point = Object.freeze(makePortfolioHistoryPoint({ total_value: 999 }))
    const source = Object.freeze([point])

    expect(buildPortfolioCompositionHistory(source)).toEqual([
      {
        date: point.date,
        composition: {
          cost: 80,
          gain: 20,
          total: 100,
          costShare: 80,
          gainShare: 20,
        },
      },
    ])
    expect(source[0].total_value).toBe(999)
  })

  it('keeps an empty source empty', () => {
    expect(buildPortfolioCompositionHistory([])).toEqual([])
  })
})
