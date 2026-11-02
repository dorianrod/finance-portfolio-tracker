// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, expect, it } from 'vitest'

import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpen.atoms'

import { AllocationPositionsToggle } from './AllocationPositionsToggle.feature'

afterEach(cleanup)
it('shows only for its active dimension and toggles positions directly', async () => {
  const store = createStore()
  const user = userEvent.setup()
  render(
    <Provider store={store}>
      <AllocationPositionsToggle dimension="secteur" />
    </Provider>,
  )
  expect(screen.queryByRole('button')).toBeNull()
  act(() =>
    store.set(dashboardDiversificationFilterAtom, {
      type: 'secteur',
      value: 'Technology',
    }),
  )
  await user.click(screen.getByRole('button'))
  expect(store.get(dashboardDiversificationPositionsOpenAtom)).toBe(true)
  await user.click(screen.getByRole('button'))
  expect(store.get(dashboardDiversificationPositionsOpenAtom)).toBe(false)
  act(() =>
    store.set(dashboardDiversificationFilterAtom, {
      type: 'geo',
      value: 'France',
    }),
  )
  expect(screen.queryByRole('button')).toBeNull()
})
