import { describe, expect, it } from 'vitest'
import type { RawOperation, RawPosition } from '@/types/domain'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/shared/filters/accountFilter'
import { computePerformanceContributions } from './performanceContribution.logic'

function position(overrides: Partial<RawPosition>): RawPosition {
  return {
    snapshot_date: '2021-01-31',
    account: 'acc1',
    account_type: 'Bourse',
    account_category: 'brokerage',
    isin: 'FR0000000001',
    ticker: 'AAA',
    name: 'Asset A',
    quantity: '10',
    avg_buy_price: '100',
    last_price: '101',
    total_value: '1010',
    unrealized_gain: '10',
    unrealized_gain_pct: '1',
    realized_gain: '0',
    total_dividends: '0',
    total_dividends_net: '0',
    total_interest: '0',
    total_interest_net: '0',
    tax_rate: '0.3',
    unrealized_gain_net: '7',
    realized_gain_net: '0',
    xirr: '1',
    xirr_rolling_3y: '',
    xirr_rolling_period_years: '',
    total_return_pct: '1',
    ...overrides,
  }
}

function operation(overrides: Partial<RawOperation>): RawOperation {
  return {
    date: '2023-01-01',
    account: 'acc1',
    isin: 'FR0000000001',
    ticker: 'AAA',
    name: 'Asset A',
    operation_type: 'SELL',
    quantity: '1',
    price_per_unit: '100',
    total_amount: '100',
    currency: 'EUR',
    realized_gain: '20',
    ...overrides,
  }
}

const noFilters = { accounts: new Set<string>(), accountTypes: new Set<string>() }

describe('computePerformanceContributions', () => {
  it('combines unrealized change, realized gains and income, including closed positions', () => {
    const positions = [
      position({ snapshot_date: '2021-01-31', unrealized_gain: '10' }),
      position({ snapshot_date: '2024-01-31', unrealized_gain: '100' }),
      position({ snapshot_date: '2021-01-31', isin: 'FR0000000002', ticker: 'BBB', name: 'Asset B', unrealized_gain: '0' }),
      position({ snapshot_date: '2024-01-31', isin: 'FR0000000002', ticker: 'BBB', name: 'Asset B', unrealized_gain: '-40' }),
      position({ snapshot_date: '2022-01-31', isin: 'FR0000000003', ticker: 'CCC', name: 'Closed asset', unrealized_gain: '0' }),
    ]
    const operations = [
      operation({ operation_type: 'SELL', realized_gain: '20' }),
      operation({ operation_type: 'DIVIDEND', total_amount: '5', realized_gain: '' }),
      operation({ isin: 'FR0000000002', ticker: 'BBB', name: 'Asset B', operation_type: 'SELL', realized_gain: '-10' }),
      operation({ isin: 'FR0000000003', ticker: 'CCC', name: 'Closed asset', operation_type: 'SELL', realized_gain: '30' }),
    ]

    const result = computePerformanceContributions(positions, operations, 'since-tracking', '2024-01-31', noFilters)

    expect(result.available).toBe(true)
    expect(result.netContribution).toBe(95)
    expect(result.contributors.map(({ label, amount, share }) => ({ label, amount, share }))).toEqual([
      { label: 'AAA', amount: 115, share: expect.closeTo(79.31, 2) },
      { label: 'CCC', amount: 30, share: expect.closeTo(20.69, 2) },
    ])
    expect(result.detractors).toMatchObject([{ label: 'BBB', amount: -50, share: 100 }])
  })

  it('groups the same asset across accounts', () => {
    const positions = [
      position({ account: 'acc1', snapshot_date: '2021-01-31', unrealized_gain: '0' }),
      position({ account: 'acc1', snapshot_date: '2024-01-31', unrealized_gain: '40' }),
      position({ account: 'acc2', snapshot_date: '2021-01-31', unrealized_gain: '10' }),
      position({ account: 'acc2', snapshot_date: '2024-01-31', unrealized_gain: '70' }),
    ]

    const result = computePerformanceContributions(positions, [], 'since-tracking', '2024-01-31', noFilters)

    expect(result.contributors).toHaveLength(1)
    expect(result.contributors[0]).toMatchObject({ label: 'AAA', amount: 100, accounts: ['acc1', 'acc2'] })
  })

  it('uses the same preceding snapshot boundary as trailing three-year IRR', () => {
    const positions = [
      position({ snapshot_date: '2021-01-31', unrealized_gain: '0' }),
      position({ snapshot_date: '2023-09-30', unrealized_gain: '10' }),
      position({ snapshot_date: '2023-10-31', unrealized_gain: '20' }),
      position({ snapshot_date: '2026-10-12', unrealized_gain: '70' }),
    ]
    const operations = [
      operation({ date: '2023-09-30', operation_type: 'DIVIDEND', total_amount: '99', realized_gain: '' }),
      operation({ date: '2023-10-01', operation_type: 'DIVIDEND', total_amount: '5', realized_gain: '' }),
    ]

    const result = computePerformanceContributions(positions, operations, 'trailing-3y', '2026-10-12', noFilters)

    expect(result.startDate).toBe('2023-09-30')
    expect(result.endDate).toBe('2026-10-12')
    expect(result.netContribution).toBe(65)
  })

  it('stops positions and operations at the selected end date', () => {
    const positions = [
      position({ snapshot_date: '2021-01-31', unrealized_gain: '0' }),
      position({ snapshot_date: '2024-01-31', unrealized_gain: '40' }),
      position({ snapshot_date: '2025-01-31', unrealized_gain: '400' }),
    ]
    const operations = [
      operation({ date: '2023-01-01', operation_type: 'DIVIDEND', total_amount: '5', realized_gain: '' }),
      operation({ date: '2024-06-01', operation_type: 'DIVIDEND', total_amount: '50', realized_gain: '' }),
    ]

    const result = computePerformanceContributions(positions, operations, 'since-tracking', '2024-03-01', noFilters)

    expect(result.endDate).toBe('2024-01-31')
    expect(result.netContribution).toBe(45)
  })

  it('applies account, account-type and synthetic-cash filters to positions and operations', () => {
    const positions = [
      position({ snapshot_date: '2021-01-31', unrealized_gain: '0' }),
      position({ snapshot_date: '2024-01-31', unrealized_gain: '100' }),
      position({ snapshot_date: '2021-01-31', isin: '', ticker: '', name: 'Cash PEA', account_type: 'Bourse – Cash', unrealized_gain: '0' }),
      position({ snapshot_date: '2024-01-31', isin: '', ticker: '', name: 'Cash PEA', account_type: 'Bourse – Cash', unrealized_gain: '0' }),
      position({ snapshot_date: '2021-01-31', account: 'acc2', account_type: 'PEE', unrealized_gain: '0' }),
      position({ snapshot_date: '2024-01-31', account: 'acc2', account_type: 'PEE', unrealized_gain: '200' }),
    ]
    const operations = [
      operation({ operation_type: 'DIVIDEND', total_amount: '5', realized_gain: '' }),
      operation({ isin: '', ticker: '', name: 'Cash PEA', operation_type: 'INTEREST', total_amount: '3', realized_gain: '' }),
    ]

    const cashOnly = computePerformanceContributions(
      positions,
      operations,
      'since-tracking',
      '2024-01-31',
      { accounts: new Set([`acc1${CASH_ACCOUNT_FILTER_SUFFIX}`]), accountTypes: new Set() },
    )
    const peeOnly = computePerformanceContributions(
      positions,
      operations,
      'since-tracking',
      '2024-01-31',
      { accounts: new Set(), accountTypes: new Set(['PEE']) },
    )

    expect(cashOnly.contributors).toMatchObject([{ label: 'Cash PEA', amount: 3 }])
    expect(peeOnly.contributors).toMatchObject([{ label: 'AAA', amount: 200, accounts: ['acc2'] }])
  })

  it('keeps only the five largest contributors and reports an unavailable short three-year history', () => {
    const positions = Array.from({ length: 7 }, (_, index) => [
      position({ snapshot_date: '2024-01-31', isin: `FR${index}`, ticker: `A${index}`, name: `Asset ${index}`, unrealized_gain: '0' }),
      position({ snapshot_date: '2025-01-31', isin: `FR${index}`, ticker: `A${index}`, name: `Asset ${index}`, unrealized_gain: String(index + 1) }),
    ]).flat()

    const sinceTracking = computePerformanceContributions(positions, [], 'since-tracking', '2025-01-31', noFilters)
    const trailing = computePerformanceContributions(positions, [], 'trailing-3y', '2025-01-31', noFilters)

    expect(sinceTracking.contributors.map((item) => item.label)).toEqual(['A6', 'A5', 'A4', 'A3', 'A2'])
    expect(trailing.available).toBe(false)
  })
})
