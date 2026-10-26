// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChartScaleToggle } from './ChartScaleToggle.view'

afterEach(cleanup)

describe('ChartScaleToggle', () => {
  it('uses the caller unit label and reports scale changes', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <ChartScaleToggle value="value" valueLabel="Units" onChange={onChange} />,
    )
    expect(
      screen
        .getByRole('button', { name: 'Units' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(screen.queryByText('€')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: '100%' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('percentage')
    rerender(
      <ChartScaleToggle
        value="percentage"
        valueLabel="$"
        onChange={onChange}
      />,
    )
    expect(
      screen.getByRole('button', { name: '$' }).getAttribute('aria-pressed'),
    ).toBe('false')
    expect(
      screen.getByRole('button', { name: '100%' }).getAttribute('aria-pressed'),
    ).toBe('true')
  })
})
