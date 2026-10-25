// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SidePanel } from './SidePanel.view'

afterEach(cleanup)

describe('SidePanel', () => {
  it('renders a rich accessible title, description, header actions and body once', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={vi.fn()}>
        <SidePanel.Title>
          Positions <strong>Europe</strong>
        </SidePanel.Title>
        <SidePanel.Description>Two matching positions</SidePanel.Description>
        <SidePanel.HeaderActions>
          <button onClick={onReset}>Reset filter</button>
        </SidePanel.HeaderActions>
        <p>Position details</p>
      </SidePanel>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Positions Europe' })
    expect(dialog.getAttribute('aria-describedby')).toBe(
      within(dialog).getByText('Two matching positions').id,
    )
    expect(within(dialog).getByRole('heading', { level: 2 }).textContent).toBe(
      'Positions Europe',
    )
    expect(within(dialog).getAllByText('Two matching positions')).toHaveLength(
      1,
    )
    expect(within(dialog).getAllByText('Position details')).toHaveLength(1)
    await user.click(
      within(dialog).getByRole('button', { name: 'Reset filter' }),
    )
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('locks scroll only while open, traps focus, closes on Escape and restores focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'auto'
    const { rerender } = render(
      <SidePanel open={false} closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <button>Last action</button>
      </SidePanel>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('auto')
    rerender(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <button>Last action</button>
      </SidePanel>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Details' })
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close details',
    })
    expect(getComputedStyle(document.body).overflow).toBe('hidden')
    expect(document.activeElement).toBe(closeButton)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Last action' }),
    )
    await user.tab()
    expect(document.activeElement).toBe(closeButton)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
    rerender(
      <SidePanel open={false} closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <button>Last action</button>
      </SidePanel>,
    )
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(document.body.style.overflow).toBe('auto')
    trigger.remove()
  })
})
