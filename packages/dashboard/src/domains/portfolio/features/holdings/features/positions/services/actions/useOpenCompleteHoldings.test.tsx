// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { makePositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/mocks/positionPreviewSelection.mock'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreview.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

import { useOpenCompleteHoldings } from './useOpenCompleteHoldings'

afterEach(cleanup)

describe('open complete holdings', () => {
  it('navigates from a position preview to fund look-through with the selected fund', () => {
    const store = createStore()
    function Wrapper({ children }: { children: ReactNode }) {
      return <Provider store={store}>{children}</Provider>
    }
    const { result } = renderHook(useOpenCompleteHoldings, { wrapper: Wrapper })
    store.set(
      positionPreviewAtom,
      makePositionPreviewSelection({ kind: 'underlying' }),
    )

    act(() => result.current('World Fund'))

    expect(store.get(dashboardActiveTabAtom)).toBe('holdings')
    expect(store.get(dashboardHoldingsViewAtom)).toBe('underlying')
    expect(store.get(dashboardUnderlyingQueryAtom)).toBe('World Fund')
    expect(store.get(positionPreviewAtom)).toBeNull()
  })
})
