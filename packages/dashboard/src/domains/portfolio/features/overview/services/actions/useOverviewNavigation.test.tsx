// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDashboardTestContext } from '@/app/mocks/dashboardTestContext.mock'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

import { useOverviewNavigation } from './useOverviewNavigation'
afterEach(cleanup)
describe('useOverviewNavigation', () => {
  it.each(['wealth', 'performance', 'holdings'] as const)(
    'opens %s without resetting the holdings subview',
    (tab) => {
      const { client, store, wrapper } = createDashboardTestContext()
      store.set(dashboardHoldingsViewAtom, 'underlying')
      const { result } = renderHook(useOverviewNavigation, { wrapper })
      act(() => result.current.navigateTo(tab))
      expect(store.get(dashboardActiveTabAtom)).toBe(tab)
      expect(store.get(dashboardHoldingsViewAtom)).toBe('underlying')
      client.clear()
    },
  )
})
