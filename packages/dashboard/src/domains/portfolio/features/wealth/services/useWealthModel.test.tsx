// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { useWealthModel } from './useWealthModel'

afterEach(cleanup)

describe('useWealthModel', () => {
  it('applies period changes to history and annual income at the consumer', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useWealthModel, { wrapper })
    expect(result.current.displayedHistory).toHaveLength(1)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        dateFrom: new Date('2030-01-01'),
      })),
    )
    await waitFor(() => expect(result.current.displayedHistory).toEqual([]))
    expect(result.current.displayedAnnualIncomeSavings).toEqual([])
    client.clear()
  })
  it('handles successful empty sources without a forwarding facade', () => {
    const { client, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useWealthModel, { wrapper })
    expect(result.current.accountTypeData).toEqual([])
    expect(result.current.wealthDrivers).toEqual([])
    client.clear()
  })
})
