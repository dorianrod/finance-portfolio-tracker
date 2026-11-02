// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { makeDashboardData } from '@/domains/portfolio/shared/mocks/dashboardData.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

import { useDemoPresetScope } from './useDemoPresetScope'
afterEach(cleanup)
describe('useDemoPresetScope', () => {
  it('builds the preset from source account identities and observes direct account selections', async () => {
    const { client, store, wrapper } = createDashboardTestContext()
    client.setQueryData(
      portfolioQueryKeys.data('dashboard'),
      makeDashboardData({ positions: [makePosition({ account: 'broker' })] }),
    )
    client.setQueryData(
      portfolioQueryKeys.data('demo-filtered-history-accounts'),
      ['broker'],
    )
    const { result } = renderHook(useDemoPresetScope, { wrapper })
    expect(result.current.demoPresetSelection).toEqual(new Set(['broker']))
    expect(result.current.demoPresetActive).toBe(false)
    act(() =>
      store.set(dashboardFiltersAtom, (current) => ({
        ...current,
        accounts: new Set(['broker']),
      })),
    )
    await waitFor(() => expect(result.current.demoPresetActive).toBe(true))
    client.clear()
  })
  it('leaves the demo unavailable when its optional account preset is absent', () => {
    const { client, wrapper } = createDashboardTestContext()
    const { result } = renderHook(useDemoPresetScope, { wrapper })
    expect(result.current.demoPresetSelection).toBeNull()
    expect(result.current.demoPresetActive).toBe(false)
    client.clear()
  })
})
