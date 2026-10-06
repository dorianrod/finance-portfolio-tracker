import { describe, it, expect } from 'vitest'
import { computeAllocationCoverageByAccount } from './allocationCoverage.logic'
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
      { account: 'pea', allocated: 1000, unallocated: 500 },
      { account: 'cto', allocated: 300, unallocated: 0 },
    ])
  })

  it('treats positions with no ISIN as allocated when their synthetic NC-<name> key matches', () => {
    const positions = [position({ account: 'bnp', isin: '', name: 'Epargne', total_value: 200 })]
    const data = rawData({ classe: [isinRow({ isin: 'NC-Epargne', name: 'Epargne' })] })

    const result = computeAllocationCoverageByAccount(positions, data)

    expect(result).toEqual([{ account: 'bnp', allocated: 200, unallocated: 0 }])
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
})
