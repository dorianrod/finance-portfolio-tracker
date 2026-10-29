import { describe, expect, it } from 'vitest'

import { makeMonthlyOperation } from '@/domains/portfolio/features/wealth/mocks/monthlyOperation.mock'
import type { MonthlyOperationType } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'

import { groupMonthlyTooltipOperations } from './groupMonthlyTooltipOperations'

describe('monthly tooltip operation groups', () => {
  it.each<[MonthlyOperationType, number, 'deposits' | 'withdrawals']>([
    ['DEPOSIT', 100, 'deposits'],
    ['DEPOSIT', -50, 'withdrawals'],
    ['WITHDRAWAL', 40, 'withdrawals'],
    ['WITHDRAWAL', -20, 'withdrawals'],
    ['WITHDRAWAL', 0, 'withdrawals'],
  ])('classifies %s of %s as %s', (operationType, amount, group) => {
    const operation = makeMonthlyOperation({
      operation_type: operationType,
      total_amount: amount,
    })
    const source = new Map([['2026-01', [operation]]])
    const result = groupMonthlyTooltipOperations(source)
    expect(result.get('2026-01')?.[group]).toEqual([{ id: 0, operation }])
    expect(source.get('2026-01')).toEqual([operation])
  })

  it('omits a zero deposit', () => {
    expect(
      groupMonthlyTooltipOperations(
        new Map([['2026-01', [makeMonthlyOperation({ total_amount: 0 })]]]),
      ).get('2026-01'),
    ).toEqual({ deposits: [], withdrawals: [] })
  })

  it('accepts an empty history', () => {
    expect(groupMonthlyTooltipOperations(new Map())).toEqual(new Map())
  })
})
