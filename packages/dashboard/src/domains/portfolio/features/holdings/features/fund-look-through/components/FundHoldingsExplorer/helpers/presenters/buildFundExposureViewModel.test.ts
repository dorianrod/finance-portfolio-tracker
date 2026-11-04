import { describe, expect, it } from 'vitest'

import { makeIssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerExposure.mock'

import { buildFundExposureViewModel } from './buildFundExposureViewModel'

describe('buildFundExposureViewModel', () => {
  it.each(['company', 'class a', 'world etf'])(
    'finds issuer, security and fund text: %s',
    (needle) => {
      const issuer = makeIssuerExposure()
      const result = buildFundExposureViewModel({
        exposures: [issuer],
        needle,
        selectedFundName: '',
        sort: 'value',
      })
      expect(result.displayed).toEqual([issuer])
      expect(result.displayed[0]).toBe(issuer)
    },
  )

  it('sorts without mutating aggregates and keeps exact fund selections unfiltered', () => {
    const exposures = [
      makeIssuerExposure({ name: 'Zulu' }),
      makeIssuerExposure({ id: 'SECOND', name: 'Alpha', value: 50 }),
    ]
    const result = buildFundExposureViewModel({
      exposures,
      needle: 'world etf',
      selectedFundName: 'World ETF',
      sort: 'name',
    })
    expect(result.displayed.map(({ name }) => name)).toEqual(['Alpha', 'Zulu'])
    expect(exposures[0].name).toBe('Zulu')
    expect(result).toMatchObject({ securityCount: 2, totalIssuerCount: 2 })
  })

  it('reports an empty search result without losing the aggregate count', () => {
    expect(
      buildFundExposureViewModel({
        exposures: [makeIssuerExposure()],
        needle: 'missing',
        selectedFundName: '',
        sort: 'value',
      }),
    ).toEqual({ displayed: [], securityCount: 0, totalIssuerCount: 1 })
  })
})
