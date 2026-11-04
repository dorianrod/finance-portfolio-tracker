import { describe, expect, it } from 'vitest'

import { makeIssuerHolding } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerHolding.mock'
import { makeIssuerPosition } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'

import { buildFundIssuerExposures } from './buildFundIssuerExposures'

describe('buildFundIssuerExposures', () => {
  it.each([
    { parentIsin: 'FUND', parentTicker: '', parentName: 'Renamed ETF' },
    { parentIsin: '', parentTicker: 'TICK', parentName: 'Renamed ETF' },
    { parentIsin: '', parentTicker: 'TICK', parentName: 'World ETF' },
  ])('scopes exact fund selection and its denominator: %j', (parent) => {
    const result = buildFundIssuerExposures(
      [
        makeIssuerPosition({
          isin: 'FUND',
          ticker: 'TICK',
          name: 'World ETF',
          total_value: 100,
        }),
        makeIssuerPosition({
          id: 'direct',
          isin: 'DIRECT',
          name: 'Other company',
          total_value: 900,
        }),
      ],
      [makeIssuerHolding({ ...parent, weight: 1 })],
      [],
      'World ETF',
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: 'COMPANY', value: 100, weight: 100 })
  })

  it('retains the full portfolio outside exact fund selection', () => {
    const result = buildFundIssuerExposures(
      [
        makeIssuerPosition({
          isin: 'FUND',
          name: 'World ETF',
          total_value: 100,
        }),
        makeIssuerPosition({
          id: 'direct',
          isin: 'DIRECT',
          name: 'Other company',
          total_value: 100,
        }),
      ],
      [makeIssuerHolding({ weight: 1 })],
      [],
      '',
    )
    expect(result.map(({ value, weight }) => ({ value, weight }))).toEqual([
      { value: 100, weight: 50 },
      { value: 100, weight: 50 },
    ])
  })

  it('returns no exposure for an absent selected fund', () => {
    expect(buildFundIssuerExposures([], [], [], 'Missing ETF')).toEqual([])
  })
})
