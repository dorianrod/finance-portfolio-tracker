// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider, useAtomValue } from 'jotai'
import { Activity, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'

import { PositionsTable } from './PositionsTable.feature'

afterEach(() => {
  cleanup()
  clearCsvCache()
  vi.unstubAllGlobals()
})

describe('PositionsTable previews', () => {
  it('closes Open all before navigating and keeps the retained table available', async () => {
    const { user, store } = setupRetainedTable()
    const trigger = screen.getByRole('button', { name: /Show composition/ })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Asset' })
    await user.click(screen.getByRole('button', { name: 'Open all →' }))

    expect(store.get(dashboardHoldingsViewAtom)).toBe('underlying')
    expect(store.get(dashboardUnderlyingQueryAtom)).toBe('Asset')
    expect(screen.queryByRole('dialog')).toBeNull()

    act(() => store.set(dashboardHoldingsViewAtom, 'positions'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: /Show composition/ })).toBe(
      trigger,
    )
    await user.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Asset' })).toBeTruthy()
  })

  it.each([
    {
      name: 'primary tab',
      leave: (store: ReturnType<typeof createStore>) =>
        store.set(dashboardActiveTabAtom, 'overview'),
      returnToTable: (store: ReturnType<typeof createStore>) =>
        store.set(dashboardActiveTabAtom, 'holdings'),
    },
    {
      name: 'holdings subview',
      leave: (store: ReturnType<typeof createStore>) =>
        store.set(dashboardHoldingsViewAtom, 'underlying'),
      returnToTable: (store: ReturnType<typeof createStore>) =>
        store.set(dashboardHoldingsViewAtom, 'positions'),
    },
  ])(
    'dismisses the preview when changing $name',
    async ({ leave, returnToTable }) => {
      const { user, store } = setupRetainedTable()
      await user.click(screen.getByRole('button', { name: /Show composition/ }))
      await screen.findByRole('dialog', { name: 'Asset' })
      act(() => leave(store))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      act(() => returnToTable(store))
      expect(screen.queryByRole('dialog')).toBeNull()
    },
  )

  it('updates an open composition preview when the source status changes', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(
        async () =>
          new Response('', {
            headers: { 'Content-Type': 'text/csv' },
          }),
      ),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    const store = createStore()
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>
          <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
      )
    }
    const data = [makePosition()]
    const status = makeFundHoldingStatus({ sourceName: 'Original source' })
    const { rerender } = render(
      <PositionsTable data={data} fundStatuses={[status]} />,
      { wrapper: Wrapper },
    )

    await user.hover(screen.getByRole('button', { name: /Show composition/ }))
    const preview = await screen.findByRole('dialog', { name: 'Asset' })
    expect(within(preview).getByText('Original source')).toBeTruthy()

    rerender(
      <PositionsTable
        data={data}
        fundStatuses={[{ ...status, sourceName: 'Updated source' }]}
      />,
    )
    expect(within(preview).getByText('Updated source')).toBeTruthy()
    expect(within(preview).queryByText('Original source')).toBeNull()
  })
})

function setupRetainedTable() {
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(
      async () =>
        new Response('', {
          headers: { 'Content-Type': 'text/csv' },
        }),
    ),
  )
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const store = createStore()
  store.set(dashboardActiveTabAtom, 'holdings')
  store.set(dashboardHoldingsViewAtom, 'positions')
  render(
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <RetainedTable />
      </Provider>
    </QueryClientProvider>,
  )
  return { store, user: userEvent.setup() }
}

function RetainedTable() {
  const tab = useAtomValue(dashboardActiveTabAtom)
  const view = useAtomValue(dashboardHoldingsViewAtom)
  return (
    <Activity
      mode={tab === 'holdings' && view === 'positions' ? 'visible' : 'hidden'}
    >
      <div>
        <PositionsTable data={POSITIONS} fundStatuses={STATUSES} />
      </div>
    </Activity>
  )
}

const POSITIONS = [makePosition()]
const STATUSES = [makeFundHoldingStatus()]
