import { describe, expect, it } from 'vitest'

import { filterMonthlyOpsByAccounts } from '@/domains/portfolio/features/wealth/helpers/selectors/filterMonthlyOpsByAccounts'
import { makeOps } from '@/domains/portfolio/features/wealth/mocks/monthlyOperations.mock'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'

describe('filterMonthlyOpsByAccounts', () => {
  it('returns the map unchanged when no account filter is set', () => {
    const ops = makeOps()
    expect(filterMonthlyOpsByAccounts(ops)).toBe(ops)
    expect(filterMonthlyOpsByAccounts(ops, new Set())).toBe(ops)
  })

  it("filters each month's operations down to the selected accounts", () => {
    const result = filterMonthlyOpsByAccounts(makeOps(), new Set(['a1']))
    expect(result.get('2024-01')).toEqual([
      {
        date: new Date('2024-01-05'),
        account: 'a1',
        operation_type: 'DEPOSIT',
        total_amount: 100,
      },
    ])
  })

  it('maps synthetic cash account ids back to raw operation accounts', () => {
    const result = filterMonthlyOpsByAccounts(
      makeOps(),
      new Set([`a1${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(result.get('2024-01')).toEqual([
      {
        date: new Date('2024-01-05'),
        account: 'a1',
        operation_type: 'DEPOSIT',
        total_amount: 100,
      },
    ])
  })
})
