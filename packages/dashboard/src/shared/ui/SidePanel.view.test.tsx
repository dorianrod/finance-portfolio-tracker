// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SidePanel } from './SidePanel.view'

afterEach(cleanup)

describe('SidePanel', () => {
  it('locks scroll only while open, traps focus, closes on Escape and restores focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'auto'
    const { rerender } = render(
      <SidePanel
        open={false}
        title="Details"
        closeLabel="Close details"
        onClose={onClose}
      >
        <button>Last action</button>
      </SidePanel>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('auto')
    rerender(
      <SidePanel
        open
        title="Details"
        closeLabel="Close details"
        onClose={onClose}
      >
        <button>Last action</button>
      </SidePanel>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Details' })
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close details',
    })
    expect(document.body.style.overflow).toBe('hidden')
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
      <SidePanel
        open={false}
        title="Details"
        closeLabel="Close details"
        onClose={onClose}
      >
        <button>Last action</button>
      </SidePanel>,
    )
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('auto')
    trigger.remove()
  })
})
