import { describe, it, expect } from 'vitest'
import { computeAllocationCoverageByAccount, computeAllocationCoverageByDimension } from './allocationCoverage.logic'
import type { RawIsinData, RawIsinRow } from '@/hooks/useRawIsinData'
import type { PositionRow } from '@/types/domain'

function position(overrides: Partial<PositionRow>): PositionRow {
  return {
    kind: 'position',
    id: 'x',
    name: 'Asset X',
    ticker: 'XYZ',
    isin: '',
    account: 'acc1',
    status: 'active',
    operationTypes: new Set(),
    quantity: 10,
    last_price: 100,
    total_value: 1000,
    unrealized_gain: 0,
    unrealized_gain_net: 0,
    unrealized_gain_pct: 0,
    realized_gain: 0,
    realized_gain_net: 0,
    tax_rate: 0,
    total_dividends: 0,
    total_dividends_net: 0,
    total_interest: 0,
    total_interest_net: 0,
    total_realized_return: 0,
    total_invested: 0,
    total_return_pct: 0,
    xirr: null,
    xirr_rolling_3y: null,
    xirr_rolling_period_years: null,
    subRows: [],
    ...overrides,
  }
}

function isinRow(overrides: Partial<RawIsinRow>): RawIsinRow {
  return { snapshot_date: '2026-09-30', isin: 'FR0000000000', name: 'Fund', values: { 'actions': 100 }, ...overrides }
}

function rawData(overrides: Partial<RawIsinData> = {}): RawIsinData {
  return { geo: [], secteur: [], currency: [], classe: [], loading: false, ...overrides }
}

describe('computeAllocationCoverageByAccount', () => {
  it('splits allocated vs unallocated value by account', () => {
    const positions = [
      position({ account: 'pea', isin: 'FR0000000000', total_value: 1000 }),
      position({ account: 'pea', isin: 'UNRESEARCHED', total_value: 500 }),
      position({ account: 'cto', isin: 'FR0000000000', total_value: 300 }),
    ]
    const data = rawData({ classe: [isinRow({ isin: 'FR0000000000' })] })

    const result = computeAllocationCoverageByAccount(positions, data)

    expect(result).toEqual([
      { account: 'pea', allocated: 1000, unallocated: 500, notApplicable: 0 },
      { account: 'cto', allocated: 300, unallocated: 0, notApplicable: 0 },
    ])
  })

  it('treats positions with no ISIN as allocated when their synthetic NC-<name> key matches', () => {
    const positions = [position({ account: 'bnp', isin: '', name: 'Epargne', total_value: 200 })]
    const data = rawData({ classe: [isinRow({ isin: 'NC-Epargne', name: 'Epargne' })] })

    const result = computeAllocationCoverageByAccount(positions, data)

    expect(result).toEqual([{ account: 'bnp', allocated: 200, unallocated: 0, notApplicable: 0 }])
  })

  it('ignores closed positions and non-positive values', () => {
    const positions = [
      position({ account: 'pea', status: 'closed', total_value: 1000 }),
      position({ account: 'pea', total_value: 0 }),
    ]

    const result = computeAllocationCoverageByAccount(positions, rawData())

    expect(result).toEqual([])
  })

  it('sorts accounts by total value descending', () => {
    const positions = [
      position({ account: 'small', total_value: 10 }),
      position({ account: 'big', total_value: 1000 }),
    ]

    const result = computeAllocationCoverageByAccount(positions, rawData())

    expect(result.map((r) => r.account)).toEqual(['big', 'small'])
  })

  it('separates savings and checking balances as not applicable', () => {
    const positions = [
      position({ account: 'livret', account_category: 'savings', isin: '', name: 'Livret A', total_value: 1_000 }),
      position({ account: 'courant', account_category: 'checking', isin: '', name: 'Compte courant', total_value: 500 }),
      position({ account: 'cto', account_type: 'Bourse – Cash', account_category: 'brokerage', isin: '', name: 'Cash CTO', total_value: 900 }),
      position({ account: 'pea', account_category: 'brokerage', isin: 'FR0000000000', total_value: 300 }),
    ]
    const data = rawData({
      classe: [
        isinRow({ isin: 'NC-Livret A', name: 'Livret A' }),
        isinRow({ isin: 'NC-Compte courant', name: 'Compte courant' }),
        isinRow({ isin: 'NC-Cash CTO', name: 'Cash CTO' }),
        isinRow({ isin: 'FR0000000000' }),
      ],
    })

    expect(computeAllocationCoverageByAccount(positions, data)).toEqual([
      { account: 'livret', allocated: 0, unallocated: 0, notApplicable: 1_000 },
      { account: 'cto', allocated: 0, unallocated: 0, notApplicable: 900 },
      { account: 'courant', allocated: 0, unallocated: 0, notApplicable: 500 },
      { account: 'pea', allocated: 300, unallocated: 0, notApplicable: 0 },
    ])
  })
})

describe('computeAllocationCoverageByDimension', () => {
  it('counts explicit nc and missing rows, with responsible assets', () => {
    const positions = [
      position({ id: 'known', isin: 'KNOWN', name: 'Partially documented', total_value: 1_000 }),
      position({ id: 'missing', isin: 'MISSING', name: 'Missing', total_value: 500 }),
    ]
    const data = rawData({
      geo: [isinRow({ isin: 'KNOWN', values: { france: 80, nc: 20 } })],
      secteur: [isinRow({ isin: 'KNOWN', values: { technology: 100 } })],
    })

    const result = computeAllocationCoverageByDimension(positions, data)

    expect(result.find((item) => item.dimension === 'geo')).toMatchObject({
      allocated: 800,
      unallocated: 700,
    })
    expect(result.find((item) => item.dimension === 'geo')?.issues).toEqual([
      { id: 'MISSING', name: 'Missing', value: 500, unallocated: 500 },
      { id: 'KNOWN', name: 'Partially documented', value: 1000, unallocated: 200 },
    ])
    expect(result.find((item) => item.dimension === 'secteur')).toMatchObject({
      allocated: 1_000,
      unallocated: 500,
    })
  })

  it('excludes savings and checking balances from dimension gaps', () => {
    const positions = [
      position({ account_category: 'savings', isin: '', name: 'Livret A', total_value: 1_000 }),
      position({ account_category: 'checking', isin: '', name: 'Compte courant', total_value: 500 }),
      position({ account_type: 'Bourse – Cash', account_category: 'brokerage', isin: '', name: 'Cash CTO', total_value: 900 }),
      position({ account_category: 'brokerage', isin: 'KNOWN', name: 'Known asset', total_value: 300 }),
    ]
    const data = rawData({ geo: [isinRow({ isin: 'KNOWN', values: { france: 100 } })] })

    const result = computeAllocationCoverageByDimension(positions, data)

    expect(result.find((item) => item.dimension === 'geo')).toMatchObject({
      allocated: 300,
      unallocated: 0,
      issues: [],
    })
  })
})
