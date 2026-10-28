import { describe, expect, it } from 'vitest'

import { buildAccountTypeBreakdown } from '@/domains/portfolio/features/wealth/helpers/aggregators/buildAccountTypeBreakdown'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('buildAccountTypeBreakdown', () => {
  it('aggregates active positions cost basis and gain by account type, sorted by total value desc', () => {
    const positions = [
      position({
        account_type: 'PEA',
        total_value: 1000,
        unrealized_gain: 100,
      }),
      position({ account_type: 'PEA', total_value: 500, unrealized_gain: -50 }),
      position({
        account_type: 'CTO',
        total_value: 2000,
        unrealized_gain: 200,
      }),
      position({
        account_type: 'PEA',
        status: 'closed',
        total_value: 9999,
        unrealized_gain: 9999,
      }),
    ]
    expect(buildAccountTypeBreakdown(positions)).toEqual([
      {
        account_type: 'CTO',
        total_cost_basis: 1800,
        unrealized_gain: 200,
        total_value: 2000,
      },
      {
        account_type: 'PEA',
        total_cost_basis: 1450,
        unrealized_gain: 50,
        total_value: 1500,
      },
    ])
  })
})
