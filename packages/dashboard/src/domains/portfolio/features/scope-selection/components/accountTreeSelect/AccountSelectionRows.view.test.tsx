// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { AccountSelectionRows } from './AccountSelectionRows.view'

afterEach(cleanup)
it.each(['tree', 'select'] as const)(
  'renders controlled flags and reports the account in %s rows',
  async (variant) => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <AccountSelectionRows
        rows={[
          { account: 'first', label: 'First account', checked: true },
          { account: 'second', label: 'Second account', checked: false },
        ]}
        onToggle={onToggle}
        variant={variant}
      />,
    )
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'First account' })
        .checked,
    ).toBe(true)
    expect(
      screen.getByRole<HTMLInputElement>('checkbox', { name: 'Second account' })
        .checked,
    ).toBe(false)
    await user.click(screen.getByRole('checkbox', { name: 'Second account' }))
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('second')
  },
)
