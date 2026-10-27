// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { filterVisibilityForTab } from '@/app/helpers/presenters/filterVisibilityForTab'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import { useFilterSummaries } from './useFilterSummaries'

afterEach(cleanup)

function filters(overrides: Partial<DashboardFilters> = {}): DashboardFilters {
  return {
    accountTypes: new Set(),
    accounts: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: true,
    ...overrides,
  }
}

describe('useFilterSummaries', () => {
  it('summarizes account, period, and operation groups', () => {
    expect(
      renderHook(() =>
        useFilterSummaries(
          filters({
            accounts: new Set(['pea', 'cto']),
            dateFrom: new Date('2026-01-01'),
            dateTo: new Date('2026-06-30'),
            operationTypes: new Set(['BUY']),
            hideClosedPositions: false,
          }),
          {},
          filterVisibilityForTab('holdings', 'positions'),
        ),
      ).result.current,
    ).toEqual([
      { key: 'accounts', label: '2 accounts' },
      { key: 'period', label: '2026-01-01 → 2026-06-30' },
      { key: 'operations', label: 'Buy' },
      { key: 'closed-positions', label: 'Closed positions included' },
    ])
  })

  it('uses a friendly account name for a single selection', () => {
    expect(
      renderHook(() =>
        useFilterSummaries(
          filters({ accounts: new Set(['pea']) }),
          { pea: 'My PEA' },
          filterVisibilityForTab('overview'),
        ),
      ).result.current[0],
    ).toEqual({ key: 'accounts', label: 'My PEA' })
  })

  it('keeps the period visible while hiding position-only filters', () => {
    expect(
      renderHook(() =>
        useFilterSummaries(
          filters({
            dateFrom: new Date('2026-01-01'),
            operationTypes: new Set(['BUY']),
          }),
          {},
          filterVisibilityForTab('holdings', 'underlying'),
        ),
      ).result.current,
    ).toEqual([{ key: 'period', label: 'Since 2026-01-01' }])
  })
})
