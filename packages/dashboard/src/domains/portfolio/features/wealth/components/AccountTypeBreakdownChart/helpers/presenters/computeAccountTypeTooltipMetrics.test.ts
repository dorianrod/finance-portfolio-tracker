import { describe, expect, it } from 'vitest'

import { createAccountTypePoint } from '@/domains/portfolio/features/wealth/mocks/accountTypePoint.mock'
import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

import { computeAccountTypeTooltipMetrics } from './computeAccountTypeTooltipMetrics'

const point: AccountTypePoint = createAccountTypePoint(-10)

describe('account tooltip metrics', () => {
  it('uses the snapshot over series fallbacks and measures its share of the raw portfolio', () => {
    const result = computeAccountTypeTooltipMetrics(
      [{ dataKey: 'total_cost_basis', value: 999, payload: point }],
      [point, { ...point, account_type: 'Savings', total_value: 210 }],
    )
    expect(result).toEqual({
      cost: 100,
      gain: -10,
      total: 90,
      portfolioShare: 30,
      gainPct: -10,
    })
  })

  it('reconstructs an account total from series values without a snapshot', () => {
    expect(
      computeAccountTypeTooltipMetrics([
        { dataKey: 'total_cost_basis', value: 100 },
        { dataKey: 'unrealized_gain', value: 20 },
      ]),
    ).toEqual({
      cost: 100,
      gain: 20,
      total: 120,
      portfolioShare: 0,
      gainPct: 20,
    })
  })
})
