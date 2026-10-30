import { describe, expect, it } from 'vitest'

import { aggregateAllocationPoints } from '@/domains/portfolio/features/diversification/features/allocation/helpers/aggregators/allocationPoints/aggregateAllocationPoints'
import { makeAccountAllocationData } from '@/domains/portfolio/features/diversification/shared/mocks/accountAllocationData.mock'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'

import { scopeRawAllocationData } from './scopeRawAllocationData'

describe('account allocation scope', () => {
  it.each([
    ['geo', 'france'],
    ['secteur', 'technology'],
    ['currency', 'EUR'],
    ['classe', 'equity'],
  ] as const)(
    'filters %s by account before aggregation',
    (dimension, category) => {
      const scoped = scopeRawAllocationData(
        makeAccountAllocationData(),
        new Set(['PEA']),
      )
      expect(aggregateAllocationPoints(scoped[dimension])).toEqual([
        {
          date: new Date('2024-01-01'),
          categories: [{ name: category, value: 10 }],
        },
      ])
    },
  )

  it('keeps brokerage cash separate through its synthetic account id', () => {
    const scoped = scopeRawAllocationData(
      makeAccountAllocationData(),
      new Set([`CTO${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )
    expect(scoped.geo.map((row) => row.isin)).toEqual(['NC-Cash CTO'])
  })

  it('leaves the original allocation data untouched without an account filter', () => {
    const data = makeAccountAllocationData()
    expect(scopeRawAllocationData(data, new Set())).toBe(data)
  })
})
