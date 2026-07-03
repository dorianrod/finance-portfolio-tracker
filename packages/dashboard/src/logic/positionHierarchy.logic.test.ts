import { describe, it, expect } from 'vitest'
import { buildAccountLabels, buildPositionRows } from './positionHierarchy.logic'
import type { RawOperation, RawPosition } from '@/types/domain'

function op(overrides: Partial<RawOperation>): RawOperation {
  return {
    date: '2024-01-01',
    account: 'acc1',
    isin: 'FR0000000001',
    ticker: '',
    name: 'Test Asset',
    operation_type: 'BUY',
    quantity: '10',
    price_per_unit: '100',
    total_amount: '-1000',
    currency: 'EUR',
    realized_gain: '',
    ...overrides,
  }
}

function pos(overrides: Partial<RawPosition>): RawPosition {
  return {
    snapshot_date: '2024-06-01',
    account: 'acc1',
    account_type: 'PEA',
    account_category: 'brokerage',
    isin: 'FR0000000001',
    ticker: '',
    name: 'Test Asset',
    quantity: '10',
    avg_buy_price: '100',
    last_price: '120',
    total_value: '1200',
    unrealized_gain: '200',
    unrealized_gain_pct: '20',
    realized_gain: '0',
    total_dividends: '50',
    total_dividends_net: '35',
    total_interest: '0',
    total_interest_net: '0',
    tax_rate: '0.3',
    unrealized_gain_net: '140',
    realized_gain_net: '0',
    xirr: '12.5',
    total_return_pct: '20',
    ...overrides,
  }
}

describe('buildAccountLabels', () => {
  it('maps account -> label, skipping rows missing either field', () => {
    expect(buildAccountLabels([
      { account: 'acc1', label: 'Compte 1' },
      { account: '', label: 'ignored' },
      { account: 'acc2', label: '' },
    ])).toEqual({ acc1: 'Compte 1' })
  })
})

describe('buildPositionRows', () => {
  it('builds an active position with a Dividends group and a Buys / Sells group', () => {
    const ops = [
      op({ operation_type: 'BUY', date: '2023-01-01', total_amount: '-1000', quantity: '10', price_per_unit: '100' }),
      op({ operation_type: 'DIVIDEND', date: '2024-01-01', total_amount: '50', quantity: '', price_per_unit: '' }),
    ]
    const rows = buildPositionRows(ops, [pos({})])

    expect(rows).toHaveLength(1)
    const row = rows[0]
    expect(row.status).toBe('active')
    expect(row.total_value).toBe(1200)
    // total_dividends comes from the latest position snapshot, not a recount of ops
    expect(row.total_dividends).toBe(50)
    expect(row.subRows.map((g) => g.label)).toEqual(['Dividends', 'Buys / Sells'])
  })

  it('marks a position with no matching latest snapshot as closed and sums realized gain from sells', () => {
    const ops = [op({ isin: 'FR9999', operation_type: 'SELL', total_amount: '500', realized_gain: '50' })]
    const rows = buildPositionRows(ops, [])
    expect(rows[0].status).toBe('closed')
    expect(rows[0].realized_gain).toBe(50)
  })

  it('passes through account_type from the pipeline CSV including "– Cash" suffix', () => {
    const ops = [op({ isin: '', ticker: '', name: 'Cash CTO', operation_type: 'DEPOSIT', total_amount: '1000' })]
    const rows = buildPositionRows(ops, [pos({ isin: '', ticker: '', name: 'Cash CTO', account_type: 'Bourse – Cash', account_category: 'brokerage' })])
    expect(rows[0].account_type).toBe('Bourse – Cash')
  })

  it('sorts active positions before closed ones', () => {
    const activeOp = op({ isin: 'ACTIVE', operation_type: 'BUY' })
    const closedOp = op({ isin: 'CLOSED', operation_type: 'SELL', total_amount: '100', realized_gain: '0' })
    const rows = buildPositionRows([closedOp, activeOp], [pos({ isin: 'ACTIVE' })])
    expect(rows.map((r) => r.id)).toEqual(['ACTIVE', 'CLOSED'])
  })
})
