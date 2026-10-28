import { describe, expect, it } from 'vitest'

import { aggregateAllocationPoints } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/aggregateAllocationPoints'
import { scopeRawAllocationData } from '@/domains/portfolio/features/diversification/shared/helpers/filters/scopeDiversificationData/scopeRawAllocationData'
import { rawData } from '@/domains/portfolio/features/diversification/shared/mocks/rawIsinData.mock'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'

describe('account allocation scope', () => {
  const data = rawData({
    geo: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { france: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { europe: 20 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage – Cash',
        isin: 'NC-Cash CTO',
        name: 'Cash CTO',
        values: { 'Not concerned': 5 },
      },
    ],
    classe: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 20 },
      },
    ],
  })
  it('filters every raw allocation dimension by account before aggregation', () => {
    const scoped = scopeRawAllocationData(data, new Set(['PEA']))

    expect(aggregateAllocationPoints(scoped.geo)).toEqual([
      {
        date: new Date('2024-01-01'),
        categories: [{ name: 'france', value: 10 }],
      },
    ])
    expect(aggregateAllocationPoints(scoped.classe)).toEqual([
      {
        date: new Date('2024-01-01'),
        categories: [{ name: 'equity', value: 10 }],
      },
    ])
  })
})

describe('account allocation scope', () => {
  const data = rawData({
    geo: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { france: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { europe: 20 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage – Cash',
        isin: 'NC-Cash CTO',
        name: 'Cash CTO',
        values: { 'Not concerned': 5 },
      },
    ],
    classe: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 20 },
      },
    ],
  })
  it('keeps brokerage cash separate through its synthetic account id', () => {
    const scoped = scopeRawAllocationData(
      data,
      new Set([`CTO${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(scoped.geo.map((row) => row.isin)).toEqual(['NC-Cash CTO'])
  })
})

describe('account allocation scope', () => {
  const data = rawData({
    geo: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { france: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { europe: 20 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage – Cash',
        isin: 'NC-Cash CTO',
        name: 'Cash CTO',
        values: { 'Not concerned': 5 },
      },
    ],
    classe: [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'PEA',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 10 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'CTO',
        account_type: 'Brokerage',
        isin: 'A',
        name: 'A',
        values: { equity: 20 },
      },
    ],
  })
  it('leaves the original allocation data untouched without an account filter', () => {
    expect(scopeRawAllocationData(data, new Set())).toBe(data)
  })
})
