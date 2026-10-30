import { describe, expect, it } from 'vitest'

import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

import { indexFundStatuses } from './indexFundStatuses'
import { statusForPosition } from './statusForPosition'

describe('indexed fund status lookup', () => {
  it.each<Partial<FundHoldingStatus>>([
    { parentIsin: 'FR1' },
    { parentTicker: 'SYMBOL' },
    { parentId: 'FR1' },
  ])('matches the available identifiers %o', (overrides) => {
    const status = makeFundHoldingStatus({
      parentId: 'other',
      parentIsin: '',
      parentTicker: '',
      ...overrides,
    })
    const index = indexFundStatuses([status])
    expect(
      statusForPosition(makePosition({ isin: 'FR1', ticker: 'SYMBOL' }), index),
    ).toBe(status)
  })

  it('keeps the first source match across different identifier kinds and duplicates', () => {
    const tickerMatch = makeFundHoldingStatus({
      parentId: 'other',
      parentIsin: '',
      parentTicker: 'SYMBOL',
    })
    const isinMatch = makeFundHoldingStatus({
      parentId: 'FR1',
      parentIsin: 'FR1',
      parentTicker: '',
    })
    const position = makePosition({ isin: 'FR1', ticker: 'SYMBOL' })
    const duplicate = makeFundHoldingStatus({
      parentId: 'FR1',
      parentIsin: 'FR1',
      parentTicker: 'SYMBOL',
    })
    const statuses = [tickerMatch, isinMatch, duplicate]
    expect(statusForPosition(position, indexFundStatuses(statuses))).toBe(
      tickerMatch,
    )
    expect(
      statusForPosition(position, indexFundStatuses([isinMatch, tickerMatch])),
    ).toBe(isinMatch)
    expect(statuses).toEqual([tickerMatch, isinMatch, duplicate])
  })

  it('falls back to the ticker when the position has no ISIN', () => {
    const status = makeFundHoldingStatus({
      parentId: 'SYMBOL',
      parentTicker: '',
    })
    expect(
      statusForPosition(
        makePosition({ isin: '', ticker: 'SYMBOL' }),
        indexFundStatuses([status]),
      ),
    ).toBe(status)
  })

  it.each(['constructor', '__proto__', 'missing', ''])(
    'leaves an unmatched or missing identifier %s unresolved',
    (identifier) => {
      const status = makeFundHoldingStatus({ parentId: '' })
      expect(
        statusForPosition(
          makePosition({ isin: identifier, ticker: '' }),
          indexFundStatuses([status]),
        ),
      ).toBeUndefined()
    },
  )

  it('accepts an empty source', () => {
    expect(
      statusForPosition(makePosition(), indexFundStatuses([])),
    ).toBeUndefined()
  })
})
