// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChoiceChip } from './ChoiceChip.view'

afterEach(cleanup)

describe('ChoiceChip', () => {
  it.each([{ active: true }, { active: false }])(
    'renders the $active state and retains click behavior',
    async ({ active }) => {
      const onClick = vi.fn()
      render(
        <span className="inline-grid ml-2">
          <ChoiceChip active={active} onClick={onClick}>
            Account
          </ChoiceChip>
        </span>,
      )
      const button = screen.getByRole('button', {
        name: 'Account',
        pressed: active,
      })
      expect(button.getAttribute('type')).toBe('button')
      await userEvent.setup().click(button)
      expect(onClick).toHaveBeenCalledOnce()
    },
  )
})
