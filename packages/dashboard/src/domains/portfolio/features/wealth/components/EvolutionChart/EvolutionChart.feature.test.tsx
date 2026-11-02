// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

import { EvolutionChart } from './EvolutionChart.feature'

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 640, 300),
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('EvolutionChart', () => {
  it('preserves reporting totals and loss attribution when switching scale', async () => {
    const user = userEvent.setup()
    render(
      <EvolutionChart
        history={[
          makePortfolioHistoryPoint({
            total_cost_basis: 125,
            unrealized_gain: -25,
          }),
        ]}
      >
        <span>Selected reporting scope</span>
      </EvolutionChart>,
    )
    expect(screen.getByText('Selected reporting scope')).toBeTruthy()
    await user.tab()
    await user.tab()
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('Total: 100 €')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: '100%' }))
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('Total: 100 €')).toBeTruthy()
    expect(screen.getByText('Unrealized P&L: -25 € · -25.0%')).toBeTruthy()
  })

  it('keeps scale selection usable for an empty history', async () => {
    const user = userEvent.setup()
    render(<EvolutionChart history={[]}>{null}</EvolutionChart>)
    await user.click(screen.getByRole('button', { name: '100%' }))
    expect(
      screen.getByRole('button', { name: '100%' }).getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.queryByText(/^Total:/)).toBeNull()
  })
})
