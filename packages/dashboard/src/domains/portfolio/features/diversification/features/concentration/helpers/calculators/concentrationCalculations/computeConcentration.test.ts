import { describe, expect, it } from 'vitest'

import { computeConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/computeConcentration'
import { computeHeldAssetConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/computeHeldAssetConcentration'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computeConcentration', () => {
  it('aggregates the same asset across accounts for concentration', () => {
    const result = computeConcentration([
      position({ id: 'a', isin: 'FR1', total_value: 600 }),
      position({ id: 'b', isin: 'FR1', total_value: 200 }),
      position({ id: 'c', isin: 'FR2', ticker: 'OTHER', total_value: 200 }),
    ])
    expect(result.topHoldingPct).toBe(80)
    expect(result.topFivePct).toBe(100)
    expect(result.holdings[0].value).toBe(800)
    expect(result.holdings[1].label).toBe('Asset X')
  })
})

describe('computeConcentration', () => {
  it('excludes synthetic brokerage cash from concentration', () => {
    const positions = [
      position({
        id: 'asset',
        isin: 'FR1',
        name: 'Invested asset',
        total_value: 100,
      }),
      position({
        id: 'cash',
        isin: '',
        ticker: '',
        name: 'Cash CTO',
        account_type: 'Bourse – Cash',
        account_category: 'brokerage',
        total_value: 900,
      }),
    ]

    const held = computeHeldAssetConcentration(positions)
    const lookThrough = computeConcentration(positions)

    expect(held).toMatchObject({ identifiedValue: 100, selectedValue: 100 })
    expect(held.holdings).toMatchObject([
      { name: 'Invested asset', weight: 100 },
    ])
    expect(lookThrough).toMatchObject({
      identifiedValue: 100,
      opaqueValue: 0,
      selectedValue: 100,
    })
    expect(lookThrough.holdings).toMatchObject([
      { name: 'Invested asset', weight: 100 },
    ])
  })
})

describe('computeConcentration', () => {
  it('does not rank account valuations or opaque funds as underlying assets', () => {
    const result = computeConcentration([
      position({
        id: 'account',
        isin: '',
        ticker: '',
        name: 'PEE account',
        total_value: 1_000,
      }),
      position({
        id: 'opaque-fund',
        isin: 'FUND-X',
        name: 'Opaque ETF',
        total_value: 500,
      }),
    ])

    expect(result.holdings).toEqual([])
    expect(result.coveragePct).toBe(0)
  })
})
