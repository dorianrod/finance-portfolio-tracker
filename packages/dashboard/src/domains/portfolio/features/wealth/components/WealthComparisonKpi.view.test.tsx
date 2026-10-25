// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { WealthComparisonKpi } from './WealthComparisonKpi.view'

afterEach(cleanup)

describe('WealthComparisonKpi', () => {
  it('renders the comparison and composes scope content only inside its tooltip', async () => {
    const user = userEvent.setup()
    render(
      <WealthComparisonKpi
        label="Contributions"
        metric={{ current: 100, previous: 80, changePct: 25 }}
        currentMonths={['2026-01', '2026-02']}
        tone="blue"
      >
        <span>Selected accounts</span>
      </WealthComparisonKpi>,
    )
    expect(screen.getByText('€100')).toBeTruthy()
    expect(screen.getByText('€80')).toBeTruthy()
    expect(screen.getByText('+25.0%')).toBeTruthy()
    expect(screen.getByText('Jan 2026 – Feb 2026')).toBeTruthy()
    expect(screen.queryByText('Selected accounts')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'More information' }))
    expect(
      within(screen.getByRole('tooltip')).getByText('Selected accounts'),
    ).toBeTruthy()
  })

  it('shows unavailable values when history is missing', () => {
    render(
      <WealthComparisonKpi
        label="Performance"
        metric={{ current: null, previous: null, changePct: null }}
        currentMonths={[]}
        tone="performance"
      >
        <span>Selected accounts</span>
      </WealthComparisonKpi>,
    )
    expect(screen.getByText('Insufficient history')).toBeTruthy()
    expect(screen.getAllByText('—')).toHaveLength(3)
  })
})
