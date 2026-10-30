import { describe, expect, it } from 'vitest'

import { computeHeldAssetConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/concentrationCalculations/computeHeldAssetConcentration'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computeHeldAssetConcentration', () => {
  it('keeps the full ranked concentration while preserving the top-ten summary', () => {
    const result = computeHeldAssetConcentration(
      Array.from({ length: 12 }, (_, index) =>
        position({
          id: `asset-${index}`,
          isin: `ISIN-${index}`,
          name: `Asset ${index}`,
          total_value: 12 - index,
        }),
      ),
    )

    expect(result.allHoldings).toHaveLength(12)
    expect(result.holdings).toHaveLength(10)
    expect(result.allHoldings.map((holding) => holding.value)).toEqual([
      12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ])
    expect(result.topTenValue).toBe(75)
  })
})

describe('computeHeldAssetConcentration', () => {
  it('computes the non-decomposed concentration at held-asset grain', () => {
    const result = computeHeldAssetConcentration([
      position({
        id: 'fund-a',
        isin: 'FUND-A',
        name: 'World ETF',
        account: 'acc1',
        total_value: 600,
      }),
      position({
        id: 'fund-b',
        isin: 'FUND-A',
        name: 'World ETF',
        account: 'acc2',
        total_value: 200,
      }),
      position({
        id: 'account',
        isin: '',
        ticker: '',
        name: 'PEE product',
        total_value: 200,
      }),
    ])

    expect(result.holdings).toHaveLength(2)
    expect(result.holdings[0]).toMatchObject({
      name: 'World ETF',
      value: 800,
      weight: 80,
    })
    expect(result.holdings[1]).toMatchObject({
      name: 'PEE product',
      value: 200,
      weight: 20,
    })
    expect(result.topTenValue).toBe(1_000)
    expect(result.topTenPct).toBe(100)
    expect(result.coveragePct).toBe(100)
  })
})
