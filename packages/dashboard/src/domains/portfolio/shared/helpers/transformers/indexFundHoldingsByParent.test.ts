import { describe, expect, it } from 'vitest'

import { makeFundHolding } from '@/domains/portfolio/shared/mocks/fundHolding.mock'

import { indexFundHoldingsByParent } from './indexFundHoldingsByParent'

describe('fund parent lookup aliases', () => {
  it.each([
    { parentIsin: 'FUND', parentTicker: 'FUND' },
    { parentIsin: 'FUND', parentTicker: '' },
    { parentIsin: '', parentTicker: 'FUND' },
  ])('indexes each holding once for $parentIsin / $parentTicker', (parent) => {
    const holding = makeFundHolding(parent)
    expect(indexFundHoldingsByParent([holding]).get('FUND')).toEqual([holding])
  })

  it('exposes distinct aliases without changing the source collection', () => {
    const holding = makeFundHolding({
      parentIsin: 'ISIN',
      parentTicker: 'TICKER',
    })
    const holdings = Object.freeze([holding])
    const result = indexFundHoldingsByParent(holdings)
    expect([...result.entries()]).toEqual([
      ['ISIN', [holding]],
      ['TICKER', [holding]],
    ])
    expect(holdings).toEqual([holding])
  })

  it('keeps empty identifiers out of the index', () => {
    expect(
      indexFundHoldingsByParent([
        makeFundHolding({ parentIsin: '', parentTicker: '' }),
      ]),
    ).toEqual(new Map())
  })
})
