// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createAccountTypePoint } from '@/domains/portfolio/features/wealth/mocks/accountTypePoint.mock'

import { AccountTypeTooltip } from './AccountTypeTooltip.feature'

afterEach(cleanup)

describe('AccountTypeTooltip', () => {
  it.each([
    { gain: -10, color: 'rgb(248, 113, 113)' },
    { gain: 0, color: 'rgb(74, 222, 128)' },
    { gain: 10, color: 'rgb(74, 222, 128)' },
  ])('uses the performance color for a gain of $gain', ({ gain, color }) => {
    render(
      <AccountTypeTooltip
        active
        payload={[
          {
            dataKey: 'unrealized_gain',
            value: gain,
            payload: createAccountTypePoint(gain),
          },
        ]}
      />,
    )
    const unrealized = screen.getByText(/^Unrealized:/)
    expect(getComputedStyle(unrealized).color).toBe(color)
  })

  it('does not render an inactive or empty point', () => {
    render(<AccountTypeTooltip active payload={[]} />)
    expect(screen.queryByText(/^Unrealized:/)).toBeNull()
  })
})
