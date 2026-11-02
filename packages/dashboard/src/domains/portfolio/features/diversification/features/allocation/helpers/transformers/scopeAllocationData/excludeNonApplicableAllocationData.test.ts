import { describe, expect, it } from 'vitest'

import { makeAccountAllocationData } from '@/domains/portfolio/features/diversification/shared/mocks/accountAllocationData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { excludeNonApplicableAllocationData } from './excludeNonApplicableAllocationData'

describe('account allocation scope', () => {
  it('removes synthetic brokerage cash from allocation analysis', () => {
    const scoped = excludeNonApplicableAllocationData(
      makeAccountAllocationData(),
      [
        makePosition({
          account: 'CTO',
          account_type: 'Brokerage – Cash',
          account_category: 'brokerage',
        }),
      ],
    )

    expect(scoped.geo.map((row) => row.isin)).toEqual(['A', 'A'])
  })
})
