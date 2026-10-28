import { describe, expect, it } from 'vitest'

import { buildCumulativeConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/buildCumulativeConcentration'
import { computeConcentration } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/computeConcentration'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('buildCumulativeConcentration', () => {
  it('builds a sorted monotone cumulative concentration from every holding', () => {
    const result = buildCumulativeConcentration([
      { label: 'Small', name: 'Small', value: 20, weight: 20 },
      { label: 'Large', name: 'Large', value: 50, weight: 50 },
      { label: 'Medium', name: 'Medium', value: 30, weight: 30 },
    ])

    expect(result.map((point) => point.name)).toEqual([
      'Large',
      'Medium',
      'Small',
    ])
    expect(result.map((point) => point.rank)).toEqual([1, 2, 3])
    expect(result.map((point) => point.cumulativeWeight)).toEqual([50, 80, 100])
  })
})

describe('buildCumulativeConcentration', () => {
  it('looks through funds and aggregates the same underlying direct and indirect exposure', () => {
    const result = computeConcentration(
      [
        position({
          id: 'fund-a',
          isin: 'FUND-A',
          name: 'World ETF',
          total_value: 1_000,
        }),
        position({
          id: 'fund-b',
          isin: 'FUND-B',
          name: 'US UCITS ETF',
          total_value: 500,
        }),
        position({
          id: 'direct',
          isin: 'DIRECT-ASSET',
          name: 'Direct Asset',
          total_value: 100,
        }),
        position({
          id: 'account',
          isin: '',
          ticker: '',
          name: 'Broker account',
          total_value: 10_000,
        }),
      ],
      [
        {
          parentIsin: 'FUND-A',
          parentTicker: '',
          parentName: 'World ETF',
          holdingId: 'DIRECT-ASSET',
          holdingName: 'Direct Asset',
          issuerId: 'DIRECT-ASSET',
          issuerName: 'Direct Asset',
          weight: 0.1,
          sourceTier: 'A',
          sourceName: 'Official',
          holdingsDate: new Date('2026-10-01'),
        },
        {
          parentIsin: 'FUND-A',
          parentTicker: '',
          parentName: 'World ETF',
          holdingId: 'US0378331005',
          holdingName: 'Apple',
          issuerId: 'apple',
          issuerName: 'Apple',
          weight: 0.08,
          sourceTier: 'A',
          sourceName: 'Official',
          holdingsDate: new Date('2026-10-01'),
        },
        {
          parentIsin: 'FUND-B',
          parentTicker: '',
          parentName: 'US UCITS ETF',
          holdingId: 'DIRECT-ASSET',
          holdingName: 'Direct Asset',
          issuerId: 'DIRECT-ASSET',
          issuerName: 'Direct Asset',
          weight: 0.2,
          sourceTier: 'A',
          sourceName: 'Official',
          holdingsDate: new Date('2026-10-01'),
        },
      ],
    )

    expect(result.holdings[0]).toMatchObject({
      label: 'Direct Asset',
      name: 'Direct Asset',
      value: 300,
      weight: (300 / 11600) * 100,
    })
    expect(result.holdings[1].value).toBe(80)
    expect(result.topTenValue).toBe(380)
    expect(result.topTenPct).toBeCloseTo((380 / 11600) * 100)
    expect(result.coveragePct).toBeCloseTo((380 / 11600) * 100)
    expect(result.undisclosedValue).toBe(1_220)
    expect(result.opaqueValue).toBe(10_000)
    expect(
      buildCumulativeConcentration(result.allHoldings).at(-1)?.cumulativeWeight,
    ).toBeCloseTo(result.coveragePct)
  })
})
