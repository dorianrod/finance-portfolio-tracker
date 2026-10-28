import { describe, expect, it } from 'vitest'

import { excludeNonApplicableAllocationData } from '@/domains/portfolio/features/diversification/shared/helpers/filters/scopeDiversificationData/excludeNonApplicableAllocationData'
import { rawData } from '@/domains/portfolio/features/diversification/shared/mocks/rawIsinData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

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
  it('removes synthetic brokerage cash from allocation analysis', () => {
    const scoped = excludeNonApplicableAllocationData(data, [
      makePosition({
        account: 'CTO',
        account_type: 'Brokerage – Cash',
        account_category: 'brokerage',
      }),
    ])

    expect(scoped.geo.map((row) => row.isin)).toEqual(['A', 'A'])
  })
})
