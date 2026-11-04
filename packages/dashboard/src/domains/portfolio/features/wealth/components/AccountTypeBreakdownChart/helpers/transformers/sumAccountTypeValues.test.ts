import { describe, expect, it } from 'vitest'

import { createAccountTypePoint } from '@/domains/portfolio/features/wealth/mocks/accountTypePoint.mock'

import { sumAccountTypeValues } from './sumAccountTypeValues'

describe('sumAccountTypeValues', () => {
  it('includes negative balances in the reporting denominator without changing the input', () => {
    const points = Object.freeze([
      Object.freeze(createAccountTypePoint(-10)),
      Object.freeze({
        ...createAccountTypePoint(110),
        account_type: 'Savings',
      }),
      Object.freeze({ ...createAccountTypePoint(-150), account_type: 'Debt' }),
    ])

    expect(sumAccountTypeValues(points)).toBe(250)
    expect(points.map((point) => point.total_value)).toEqual([90, 210, -50])
  })

  it('returns zero for an empty portfolio', () => {
    expect(sumAccountTypeValues([])).toBe(0)
  })
})
