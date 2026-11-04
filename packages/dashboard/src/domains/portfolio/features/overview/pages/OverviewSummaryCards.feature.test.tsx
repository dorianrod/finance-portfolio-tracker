// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it } from 'vitest'

import { metric } from '@/domains/portfolio/features/overview/mocks/comparedMetric.mock'
import { comparison } from '@/domains/portfolio/features/overview/mocks/overviewComparison.mock'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

import { OverviewSummaryCards } from './OverviewSummaryCards.feature'

afterEach(cleanup)

describe('OverviewSummaryCards', () => {
  it.each<{ status: IrrStatus; expected: string }>([
    { status: 'ready', expected: '+8.42%' },
    { status: 'loading', expected: 'Calculating…' },
    { status: 'error', expected: '—' },
  ])('shows the current IRR with status $status', ({ status, expected }) => {
    renderCards(comparison(), status)
    expect(screen.getByText('IRR · trailing 3y')).toBeTruthy()
    expect(screen.getByText(expected)).toBeTruthy()
    expect(screen.queryByText('+6.20%')).toBeNull()
  })

  it('renders four drill-down cards and compact secondary metrics', () => {
    renderCards()
    expect(
      screen.getAllByRole('button', { name: /^Open .* details$/u }),
    ).toHaveLength(4)
    expect(
      screen.getByRole('button', { name: 'Open Portfolio value details' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Open Net contributions details' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Open Performance & income details' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Open Concentration details' }),
    ).toBeTruthy()
    expect(screen.getByText('After estimated tax')).toBeTruthy()
    expect(screen.getByText('€117,000')).toBeTruthy()
    expect(screen.queryByText('+€19,000')).toBeNull()
    expect(screen.queryByText('€98,000')).toBeNull()
    expect(screen.getByText('€800')).toBeTruthy()
    expect(screen.queryByText('+€150')).toBeNull()
    expect(
      screen.getByText('Held positions · largest 24.0% · top five 62.0%'),
    ).toBeTruthy()
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.queryByText('Previous:', { exact: false })).toBeNull()
  })

  it.each([
    { previous: 100_000, expected: 'Previous: €100,000' },
    { previous: 0, expected: 'Previous: €0' },
    { previous: -100, expected: 'Previous: -€100' },
    { previous: null, expected: 'Previous: Unavailable' },
  ])(
    'reveals the previous amount $previous when hovering the delta',
    async ({ previous, expected }) => {
      const user = userEvent.setup()
      const model = comparison()
      model.value = metric(120_000, previous)
      renderCards(model)
      await user.hover(screen.getByRole('button', { name: expected }))
      expect(await screen.findByRole('tooltip')).toHaveProperty(
        'textContent',
        expected,
      )
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('tooltip')).toBeNull()
    },
  )

  it('reveals the previous amount with keyboard focus', async () => {
    const user = userEvent.setup()
    renderCards()
    await user.tab()
    await user.tab()
    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveProperty(
      'textContent',
      'Previous: €100,000',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('reveals the previous concentration percentage when hovering its delta', async () => {
    const user = userEvent.setup()
    renderCards()
    await user.hover(screen.getByRole('button', { name: 'Previous: 26.0%' }))
    expect(await screen.findByRole('tooltip')).toHaveProperty(
      'textContent',
      'Previous: 26.0%',
    )
  })

  it('shows unavailable net value when the period-end tax data is missing', () => {
    const model = comparison()
    model.netValue = null
    renderCards(model)
    expect(screen.getByText('After estimated tax')).toBeTruthy()
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('shows unavailable states for missing historical metrics', () => {
    const model = comparison()
    model.value = metric(null, null)
    model.heldConcentration = {
      current: null,
      previous: null,
      topHolding: metric(null, null),
      topFive: metric(null, null),
    }
    model.lookThroughConcentration = model.heldConcentration
    renderCards(model, 'error')
    expect(
      screen.getByRole('button', { name: 'Previous: Unavailable' }),
    ).toBeTruthy()
    expect(
      screen.getByText(
        'Underlying detail unavailable · showing held positions',
      ),
    ).toBeTruthy()
  })
})

function renderCards(model = comparison(), irrStatus: IrrStatus = 'ready') {
  return render(
    <Provider store={createStore()}>
      <QueryClientProvider client={new QueryClient()}>
        <OverviewSummaryCards
          comparison={model}
          heldConcentration={model.heldConcentration}
          underlyingConcentration={model.lookThroughConcentration}
          rollingThreeYearTri={metric(8.42, 6.2)}
          irrStatus={irrStatus}
        />
      </QueryClientProvider>
    </Provider>,
  )
}
