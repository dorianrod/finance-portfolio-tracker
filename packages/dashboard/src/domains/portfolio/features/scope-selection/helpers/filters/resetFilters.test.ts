import { describe, expect, it } from 'vitest'

import { DEFAULT_DASHBOARD_FILTERS } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/defaultDashboardFilters'

import { resetFilters } from './resetFilters'

describe('resetFilters', () => {
  it('restores the shared defaults with independent editable collections', () => {
    const first = resetFilters()
    const second = resetFilters()
    expect(first).toEqual(DEFAULT_DASHBOARD_FILTERS)

    first.accounts.add('first-account')
    first.accountTypes.add('Brokerage')
    first.operationTypes.add('BUY')

    expect(second).toEqual({
      accountTypes: new Set(),
      accounts: new Set(),
      operationTypes: new Set(),
      hideClosedPositions: true,
    })
    expect(DEFAULT_DASHBOARD_FILTERS).toEqual(second)
  })
})
