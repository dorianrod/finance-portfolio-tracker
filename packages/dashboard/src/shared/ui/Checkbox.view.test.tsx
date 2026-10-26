// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox.view'

afterEach(cleanup)

describe('Checkbox', () => {
  it('synchronizes native indeterminate state, preserves selection actions and keeps appearance with layout overrides', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <label>
        Accounts
        <Checkbox
          checked={false}
          indeterminate
          onChange={onChange}
          className="ml-2"
        />
      </label>,
    )
    const input = screen.getByRole('checkbox', {
      name: 'Accounts',
    }) as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    expect(input.className).toContain('accent-accent')
    expect(input.className).toContain('ml-2')
    await userEvent.setup().click(input)
    expect(onChange).toHaveBeenCalledOnce()
    rerender(
      <label>
        Accounts
        <Checkbox checked indeterminate={false} onChange={onChange} />
      </label>,
    )
    expect(input.indeterminate).toBe(false)
    expect(input.checked).toBe(true)
  })
})
