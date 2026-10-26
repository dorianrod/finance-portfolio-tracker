// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChoiceChip } from './ChoiceChip.view'

afterEach(cleanup)

describe('ChoiceChip', () => {
  it.each([
    { active: true, appearance: 'border-accent-solid' },
    { active: false, appearance: 'border-border-strong' },
  ])(
    'renders the $active state and retains click behavior',
    async ({ active, appearance }) => {
      const onClick = vi.fn()
      render(
        <ChoiceChip active={active} onClick={onClick} className="ml-2">
          Account
        </ChoiceChip>,
      )
      const button = screen.getByRole('button', { name: 'Account' })
      expect(button.getAttribute('aria-pressed')).toBe(String(active))
      expect(button.getAttribute('type')).toBe('button')
      expect(button.className).toContain(appearance)
      expect(button.className).toContain('ml-2')
      expect(button.hasAttribute('active')).toBe(false)
      await userEvent.setup().click(button)
      expect(onClick).toHaveBeenCalledOnce()
    },
  )
})
