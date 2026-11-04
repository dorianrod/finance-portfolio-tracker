// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAccountTypePoint } from '@/domains/portfolio/features/wealth/mocks/accountTypePoint.mock'

import { AccountTypeBreakdownChart } from './AccountTypeBreakdownChart.feature'

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

describe('AccountTypeBreakdownChart', () => {
  it('shows the prepared portfolio denominator when navigating a slice with the keyboard', async () => {
    const user = userEvent.setup()
    render(
      <AccountTypeBreakdownChart
        data={[
          createAccountTypePoint(-10),
          { ...createAccountTypePoint(110), account_type: 'Savings' },
        ]}
      >
        <span>Selected account scope</span>
      </AccountTypeBreakdownChart>,
    )

    expect(screen.getByText('Selected account scope')).toBeTruthy()
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('Portfolio share: 70.0%')).toBeTruthy()
    await user.keyboard('{ArrowLeft}')
    expect(await screen.findByText('Portfolio share: 30.0%')).toBeTruthy()
    expect(screen.getByText('Total: 90 €')).toBeTruthy()
  })

  it('keeps an empty portfolio renderable without inventing a tooltip', () => {
    render(
      <AccountTypeBreakdownChart data={[]}>{null}</AccountTypeBreakdownChart>,
    )
    expect(
      screen.getByRole('heading', { name: 'Breakdown by account type' }),
    ).toBeTruthy()
    expect(screen.queryByText(/^Portfolio share:/)).toBeNull()
  })
})
