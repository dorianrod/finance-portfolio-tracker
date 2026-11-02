// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makeAccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/mocks/accountTypeHistoryPoint.mock'

import { AccountTypeHistoryChart } from './AccountTypeHistoryChart.feature'

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

describe('AccountTypeHistoryChart', () => {
  it('shows selected-account totals and keeps them when switching chart scale', async () => {
    const user = userEvent.setup()
    render(
      <AccountTypeHistoryChart
        data={[
          makeAccountTypeHistoryPoint({
            values: { Brokerage: 1, Savings: 2, Excluded: 100 },
          }),
        ]}
        accountTypes={['Brokerage', 'Savings']}
        typeCategories={{}}
      >
        <span>Selected account scope</span>
      </AccountTypeHistoryChart>,
    )

    expect(screen.getByText('Selected account scope')).toBeTruthy()
    await user.tab()
    await user.tab()
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('Total: 3 €')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: '100%' }))
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('Total: 3 €')).toBeTruthy()
  })

  it('keeps scale selection available for an empty history', async () => {
    const user = userEvent.setup()
    render(
      <AccountTypeHistoryChart data={[]} accountTypes={[]} typeCategories={{}}>
        {null}
      </AccountTypeHistoryChart>,
    )
    await user.click(screen.getByRole('button', { name: '100%' }))
    expect(
      screen.getByRole('button', { name: '100%' }).getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.queryByText(/^Total:/)).toBeNull()
  })
})
