// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { afterEach, describe, expect, it } from 'vitest'

import { Popover } from './Popover.view'

afterEach(cleanup)

describe('popover keyboard boundaries', () => {
  it.each([{ shift: false }, { shift: true }])(
    'keeps a modal popover open when tabbing with shift=$shift',
    async ({ shift }) => {
      const user = userEvent.setup()
      render(
        <Provider store={createStore()}>
          <Popover modal>
            <Popover.Trigger>Accounts</Popover.Trigger>
            <Popover.Content label="Choose accounts">
              <button>Only option</button>
            </Popover.Content>
          </Popover>
          <button>Outside action</button>
        </Provider>,
      )
      await user.click(screen.getByRole('button', { name: 'Accounts' }))
      await user.tab({ shift })
      expect(
        screen.getByRole('dialog', { name: 'Choose accounts' }),
      ).toBeTruthy()
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Only option' }),
      )
    },
  )

  it.each([
    {
      name: 'a hidden ancestor',
      unavailable: (
        <div style={{ display: 'none' }}>
          <button>Hidden option</button>
        </div>
      ),
    },
    {
      name: 'an inert ancestor',
      unavailable: (
        <div inert>
          <button>Inert option</button>
        </div>
      ),
    },
    {
      name: 'a hidden input',
      unavailable: <input type="hidden" />,
    },
    {
      name: 'a disabled fieldset',
      unavailable: (
        <fieldset disabled>
          <button>Disabled option</button>
        </fieldset>
      ),
    },
  ])('ignores $name at the Tab boundary', async ({ unavailable }) => {
    const user = userEvent.setup()
    render(
      <Provider store={createStore()}>
        <Popover>
          <Popover.Trigger>Accounts</Popover.Trigger>
          <Popover.Content label="Choose accounts">
            <button>Last option</button>
            {unavailable}
          </Popover.Content>
        </Popover>
        <button>Next action</button>
      </Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    await user.click(screen.getByRole('button', { name: 'Last option' }))
    await user.tab()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Next action' }),
    )
  })

  it('skips controls inside hidden ancestors when leaving the popover', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={createStore()}>
        <Popover>
          <Popover.Trigger>Accounts</Popover.Trigger>
          <Popover.Content label="Choose accounts">
            <button>Last option</button>
          </Popover.Content>
        </Popover>
        <div style={{ display: 'none' }}>
          <button>Hidden destination</button>
        </div>
        <button>Next action</button>
      </Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Accounts' }))
    await user.tab()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Next action' }),
    )
  })
})
