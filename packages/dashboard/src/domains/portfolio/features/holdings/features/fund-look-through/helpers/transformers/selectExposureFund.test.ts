import { describe, expect, it } from 'vitest'

import { makeIssuerPosition } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'

import { selectExposureFund } from './selectExposureFund'

describe('selectExposureFund', () => {
  it.each([
    { parentId: 'FUND', parentIsin: '', parentTicker: '' },
    { parentId: '', parentIsin: 'FUND', parentTicker: '' },
    { parentId: '', parentIsin: '', parentTicker: 'TICK' },
  ])(
    'selects an exact fund name using its status identifiers: %j',
    (status) => {
      expect(
        selectExposureFund(
          [
            makeIssuerPosition({
              isin: 'FUND',
              ticker: 'TICK',
              name: 'World ETF',
            }),
          ],
          [makeFundHoldingStatus(status)],
          'world etf',
        ),
      ).toBe('World ETF')
    },
  )

  it.each(['', 'world', 'unknown'])(
    'keeps ordinary text search unscoped: %s',
    (needle) => {
      expect(
        selectExposureFund(
          [makeIssuerPosition({ isin: 'FUND', name: 'World ETF' })],
          [makeFundHoldingStatus({ parentId: 'FUND' })],
          needle,
        ),
      ).toBe('')
    },
  )

  it('does not treat an unrecognized direct position as a fund', () => {
    expect(
      selectExposureFund(
        [makeIssuerPosition({ isin: 'DIRECT', name: 'Company' })],
        [],
        'company',
      ),
    ).toBe('')
  })
})
