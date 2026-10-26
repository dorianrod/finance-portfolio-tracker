// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AccountTreeSelect } from '@/domains/portfolio/shared/components/filters/accountTreeSelect/AccountTreeSelect.feature'
import { SidePanel } from '@/shared/ui/SidePanel.view'

const ACCOUNT_OPTIONS = {
  allAccountTypes: ['PEA'],
  accountToType: { first: 'PEA', second: 'PEA' },
  allAccounts: ['first', 'second'],
  accountLabels: { first: 'First account', second: 'Second account' },
}

afterEach(cleanup)

describe('AccountTreeSelect', () => {
  it('dismisses the picker with Escape before its dialog and restores trigger focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onChange = vi.fn()
    render(
      <SidePanel open closeLabel="Close filters" onClose={onClose}>
        <SidePanel.Title>Filters</SidePanel.Title>
        <AccountTreeSelect
          {...ACCOUNT_OPTIONS}
          selected={new Set()}
          onChange={onChange}
        />
      </SidePanel>,
    )
    const trigger = screen.getByRole('button', { name: 'All accounts' })
    await user.click(trigger)
    await user.click(screen.getByRole('checkbox', { name: 'First account' }))
    expect(onChange).toHaveBeenCalledWith(new Set(['first']))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes when keyboard focus leaves the picker', async () => {
    const user = userEvent.setup()
    render(
      <>
        <AccountTreeSelect
          {...ACCOUNT_OPTIONS}
          selected={new Set()}
          onChange={vi.fn()}
        />
        <button>Next control</button>
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'All accounts' }))
    await user.click(screen.getByRole('checkbox', { name: 'Second account' }))
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Next control' }),
    )
    expect(screen.queryByRole('checkbox')).toBeNull()
  })
})
