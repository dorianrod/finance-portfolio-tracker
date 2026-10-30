import { describe, expect, it } from 'vitest'

import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/cashAccountFilterSuffix'
import { buildHistoricalConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalConcentration'
import { buildHistoricalLookThroughConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalLookThroughConcentration'
import { historicalHolding } from '@/domains/portfolio/shared/mocks/historicalFundHolding.mock'
import { row } from '@/domains/portfolio/shared/mocks/historicalPosition.mock'

describe('buildHistoricalConcentration', () => {
  it('aggregates the same ISIN across accounts and ranks holdings', () => {
    const result = buildHistoricalConcentration([
      row({ account: 'PEA', total_value: 60 }),
      row({ account: 'CTO', total_value: 40 }),
      row({ isin: 'ISIN-B', ticker: 'BBB', name: 'Asset B', total_value: 50 }),
    ])

    expect(result).toHaveLength(1)
    expect(result[0].holdings[0]).toMatchObject({ key: 'ISIN-A', value: 100 })
    expect(result[0]).toMatchObject({
      positionsTo25Pct: 1,
      positionsTo50Pct: 1,
      positionsTo75Pct: 2,
      positionsTo90Pct: 2,
    })
  })

  it('falls back from ISIN to ticker and then name', () => {
    const result = buildHistoricalConcentration([
      row({ isin: '', ticker: 'TICK', name: 'Ticker asset', total_value: 60 }),
      row({ isin: '', ticker: '', name: 'Named asset', total_value: 40 }),
    ])

    expect(result[0].holdings.map((holding) => holding.key)).toEqual([
      'TICK',
      'Named asset',
    ])
  })

  it('computes minimum position counts for each threshold and the effective count', () => {
    const rows = Array.from({ length: 10 }, (_, index) =>
      row({
        isin: `ISIN-${index}`,
        ticker: `T${index}`,
        name: `Asset ${index}`,
        total_value: 100,
      }),
    )
    const point = buildHistoricalConcentration(rows)[0]

    expect(point.positionsTo25Pct).toBe(3)
    expect(point.positionsTo50Pct).toBe(5)
    expect(point.positionsTo75Pct).toBe(8)
    expect(point.positionsTo90Pct).toBe(9)
    expect(point.effectiveCount).toBeCloseTo(10)
    expect(point.holdingCount).toBe(10)
  })

  it('excludes non-investment accounts, brokerage cash and non-positive values', () => {
    const result = buildHistoricalConcentration([
      row({ isin: 'VALID', total_value: 100 }),
      row({ isin: 'SAVINGS', account_category: 'savings', total_value: 500 }),
      row({ isin: 'CHECKING', account_category: 'checking', total_value: 500 }),
      row({ isin: 'CASH', account_type: 'Brokerage – Cash', total_value: 500 }),
      row({ isin: 'ZERO', total_value: 0 }),
      row({ isin: 'NEGATIVE', total_value: -10 }),
    ])

    expect(result[0].holdings.map((holding) => holding.key)).toEqual(['VALID'])
  })

  it('respects account and account-type filters including synthetic cash ids', () => {
    const rows = [
      row({ account: 'PEA', account_type: 'Brokerage', isin: 'A' }),
      row({ account: 'CTO', account_type: 'Brokerage', isin: 'B' }),
      row({ account: 'CTO', account_type: 'Brokerage – Cash', isin: 'CASH' }),
    ]

    expect(
      buildHistoricalConcentration(rows, new Set(['PEA']))[0].holdings.map(
        (holding) => holding.key,
      ),
    ).toEqual(['A'])
    expect(
      buildHistoricalConcentration(
        rows,
        new Set(),
        new Set(['Brokerage']),
      )[0].holdings.map((holding) => holding.key),
    ).toEqual(['A', 'B'])
    expect(
      buildHistoricalConcentration(
        rows,
        new Set([`CTO${CASH_ACCOUNT_FILTER_SUFFIX}`]),
      ),
    ).toEqual([])
  })

  it('omits snapshots without an eligible positive holding', () => {
    expect(
      buildHistoricalConcentration([
        row({ snapshot_date: new Date('2025-01-31'), total_value: 0 }),
        row({
          snapshot_date: new Date('2025-02-28'),
          account_category: 'savings',
        }),
      ]),
    ).toEqual([])
  })
})

describe('buildHistoricalLookThroughConcentration', () => {
  it('uses the latest non-future fund snapshot and aggregates direct and indirect issuer exposure', () => {
    const result = buildHistoricalLookThroughConcentration(
      [
        row({
          snapshot_date: new Date('2024-12-31'),
          isin: 'DIRECT-BEFORE-HISTORY',
          name: 'Direct before history',
          total_value: 500,
        }),
        row({
          snapshot_date: new Date('2025-01-31'),
          isin: 'ISIN-FUND',
          name: 'Example UCITS ETF',
          total_value: 100,
        }),
        row({
          snapshot_date: new Date('2025-01-31'),
          isin: 'ISSUER-UNDERLYING',
          name: 'Underlying Corp',
          total_value: 40,
        }),
        row({
          snapshot_date: new Date('2025-02-28'),
          isin: 'ISIN-FUND',
          name: 'Example UCITS ETF',
          total_value: 100,
        }),
      ],
      [
        historicalHolding(),
        historicalHolding({
          effectiveDate: new Date('2025-03-31'),
          holdingsDate: new Date('2025-03-31'),
          historySnapshotId: '2025-03-31/ISIN-FUND/future',
          weight: 1,
        }),
      ],
    )

    expect(result[0].date).toEqual(new Date('2025-01-31'))
    expect(result[0].holdings[0]).toMatchObject({
      key: 'ISSUER-UNDERLYING',
      value: 100,
    })
    expect(result[0]).toMatchObject({
      selectedValue: 140,
      identifiedValue: 100,
      undisclosedValue: 40,
      coveragePct: 71.42857142857143,
      positionsTo75Pct: null,
      positionsTo90Pct: null,
    })
    expect(result[1].holdings[0].value).toBe(60)
  })

  it('returns no trend when no historical underlying data exists', () => {
    const result = buildHistoricalLookThroughConcentration(
      [
        row({
          isin: 'UNKNOWN-FUND',
          name: 'Unknown UCITS Fund',
          total_value: 60,
        }),
        row({
          isin: '',
          ticker: '',
          name: 'Opaque retirement wrapper',
          total_value: 40,
        }),
      ],
      [],
    )

    expect(result).toEqual([])
  })

  it('keeps unresolved funds and opaque wrappers in the denominator after history begins', () => {
    const result = buildHistoricalLookThroughConcentration(
      [
        row({
          isin: 'UNKNOWN-FUND',
          name: 'Unknown UCITS Fund',
          total_value: 60,
        }),
        row({
          isin: '',
          ticker: '',
          name: 'Opaque retirement wrapper',
          total_value: 40,
        }),
        row({ isin: 'ISIN-FUND', name: 'Example UCITS ETF', total_value: 10 }),
      ],
      [historicalHolding()],
    )[0]

    expect(result).toMatchObject({
      selectedValue: 110,
      identifiedValue: 6,
      undisclosedValue: 64,
      opaqueValue: 40,
      coveragePct: 5.454545454545454,
      positionsTo25Pct: null,
    })
    expect(result.holdings).toHaveLength(1)
  })
})
