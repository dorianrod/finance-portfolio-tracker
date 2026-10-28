import { describe, expect, it } from 'vitest'

import { buildIssuerExposures } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/issuerExposures/buildIssuerExposures'
import { makeIssuerHolding as holding } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerHolding.mock'
import { makeIssuerPosition as position } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/issuerPosition.mock'

describe('buildIssuerExposures', () => {
  it('groups share classes and direct holdings under one issuer', () => {
    const positions = [
      position({
        id: 'fund',
        isin: 'FUND',
        name: 'World ETF',
        total_value: 1_000,
      }),
      position({
        id: 'direct',
        isin: 'COMPANY',
        name: 'Company',
        total_value: 100,
      }),
      position({ id: 'opaque', name: 'Private equity', total_value: 900 }),
    ]
    const holdings = [
      holding({
        holdingId: 'CLASS-A',
        holdingName: 'Company class A',
        weight: 0.1,
      }),
      holding({
        holdingId: 'CLASS-C',
        holdingName: 'Company class C',
        weight: 0.05,
      }),
    ]

    const result = buildIssuerExposures(positions, holdings)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'COMPANY',
      name: 'Company',
      value: 250,
      weight: 12.5,
    })
    expect(
      new Set(result[0].securities.map((security) => security.id)),
    ).toEqual(new Set(['COMPANY', 'CLASS-A', 'CLASS-C']))
    expect(result[0].funds).toEqual(['Direct', 'World ETF'])
    expect(result[0].sources).toEqual([
      { fund: 'World ETF', value: 150 },
      { fund: 'Direct', value: 100 },
    ])
    const direct = result[0].securities.find(
      (security) => security.id === 'COMPANY',
    )
    expect(direct?.sources).toEqual([{ fund: 'Direct', value: 100 }])
  })

  it('lists a security held both directly and through a fund with both sources', () => {
    const result = buildIssuerExposures(
      [
        position({
          id: 'fund',
          isin: 'FUND',
          name: 'World ETF',
          total_value: 1_000,
        }),
        position({
          id: 'direct',
          isin: 'COMPANY',
          name: 'Company',
          total_value: 100,
        }),
      ],
      [holding({ holdingId: 'COMPANY', weight: 0.1 })],
    )
    expect(result[0].securities).toHaveLength(1)
    expect(result[0].securities[0].sources).toEqual([
      { fund: 'World ETF', value: 100 },
      { fund: 'Direct', value: 100 },
    ])
  })

  it('scales provider rounding above 100% back to the fund value', () => {
    const result = buildIssuerExposures(
      [position({ isin: 'FUND', name: 'World ETF', total_value: 100 })],
      [
        holding({ weight: 0.6 }),
        holding({
          holdingId: 'SECOND',
          issuerId: 'SECOND',
          issuerName: 'Second',
          weight: 0.5,
        }),
      ],
    )
    expect(result.reduce((sum, issuer) => sum + issuer.value, 0)).toBeCloseTo(
      100,
    )
  })

  it('excludes synthetic brokerage cash from underlying exposure and its denominator', () => {
    const result = buildIssuerExposures(
      [
        position({ isin: 'COMPANY', name: 'Company', total_value: 100 }),
        position({
          name: 'Cash CTO',
          account_type: 'Bourse – Cash',
          account_category: 'brokerage',
          total_value: 900,
        }),
      ],
      [],
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      name: 'Company',
      value: 100,
      weight: 100,
    })
  })

  it('merges a strongly truncated official issuer name', () => {
    const result = buildIssuerExposures(
      [position({ isin: 'FUND', name: 'World ETF', total_value: 100 })],
      [
        holding({
          issuerId: 'taiwansemiconductormanufac',
          issuerName: 'TAIWAN SEMICONDUCTOR MANUFAC',
          weight: 0.1,
        }),
        holding({
          holdingId: 'SECOND',
          issuerId: 'taiwansemiconductormanufacturing',
          issuerName: 'TAIWAN SEMICONDUCTOR MANUFACTURING',
          weight: 0.1,
        }),
      ],
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'taiwansemiconductormanufacturing',
      value: 20,
    })
  })
})
