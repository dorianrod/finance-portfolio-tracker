// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import type { MouseEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Tooltip } from './Tooltip.view'

afterEach(cleanup)

describe('tooltip trigger actions', () => {
  it('calls the supplied action and opens its tooltip on click', async () => {
    const user = userEvent.setup({ skipHover: true })
    const onClick = vi.fn()
    render(
      <Provider store={createStore()}>
        <Tooltip>
          <Tooltip.Trigger onClick={onClick}>Explain</Tooltip.Trigger>
          <Tooltip.Content>Details</Tooltip.Content>
        </Tooltip>
      </Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Explain' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(await screen.findByRole('tooltip')).toHaveProperty(
      'textContent',
      'Details',
    )
  })

  it('allows the supplied action to cancel click activation', async () => {
    const user = userEvent.setup({ skipHover: true })
    const onClick = vi.fn((event: MouseEvent<HTMLButtonElement>) =>
      event.preventDefault(),
    )
    render(
      <Provider store={createStore()}>
        <Tooltip>
          <Tooltip.Trigger onClick={onClick}>Explain</Tooltip.Trigger>
          <Tooltip.Content>Details</Tooltip.Content>
        </Tooltip>
      </Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Explain' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('forwards pointer-leave actions and preserves Escape dismissal', async () => {
    const user = userEvent.setup()
    const onMouseLeave = vi.fn()
    render(
      <Provider store={createStore()}>
        <Tooltip>
          <Tooltip.Trigger onMouseLeave={onMouseLeave}>Explain</Tooltip.Trigger>
          <Tooltip.Content>Details</Tooltip.Content>
        </Tooltip>
      </Provider>,
    )
    const trigger = screen.getByRole('button', { name: 'Explain' })
    await user.hover(trigger)
    await screen.findByRole('tooltip')
    await user.unhover(trigger)
    expect(onMouseLeave).toHaveBeenCalledOnce()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })
})
