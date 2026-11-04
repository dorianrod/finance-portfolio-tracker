// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ColHeader } from './ColHeader.view'
import { SidePanel } from './SidePanel.view'

afterEach(cleanup)

describe('ColHeader', () => {
  it('keeps the decorative help icon out of the column name', () => {
    render(
      <table>
        <thead>
          <tr>
            <th>
              <ColHeader label="Value" content="Current market value" />
            </th>
          </tr>
        </thead>
      </table>,
    )
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'More information about Value' }),
    ).toBeTruthy()
  })

  it('identifies the column when the visible label is rendered separately', () => {
    render(
      <ColHeader
        label=""
        columnName="Current value"
        content="Current market value"
      />,
    )
    expect(
      screen.getByRole('button', {
        name: 'More information about Current value',
      }),
    ).toBeTruthy()
  })
  it('keeps information open after clicking or leaving a focused trigger', async () => {
    const user = userEvent.setup()
    render(<ColHeader label="Value" content="Current market value" />)
    const trigger = screen.getByRole('button', {
      name: 'More information about Value',
    })
    await user.click(trigger)
    expect(screen.getByRole('tooltip').textContent).toBe('Current market value')
    await user.unhover(trigger)
    expect(screen.getByRole('tooltip').textContent).toBe('Current market value')
    expect(trigger.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('dismisses the tooltip before closing its containing panel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <ColHeader label="Value" content="Current market value" />
      </SidePanel>,
    )
    await user.click(
      screen.getByRole('button', { name: 'More information about Value' }),
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
