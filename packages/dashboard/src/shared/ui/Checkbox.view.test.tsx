// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox.view'

afterEach(cleanup)

describe('Checkbox', () => {
  it('synchronizes native indeterminate state, preserves selection actions and keeps appearance with layout on the parent', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <label>
        Accounts
        <span className="inline-grid ml-2">
          <Checkbox checked={false} indeterminate onChange={onChange} />
        </span>
      </label>,
    )
    const input = screen.getByRole('checkbox', {
      name: 'Accounts',
    }) as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    expect(input.className).toContain('accent-accent')
    expect(input.className).not.toContain('ml-2')
    expect(input.parentElement?.className).toContain('ml-2')
    await userEvent.setup().click(input)
    expect(onChange).toHaveBeenCalledOnce()
    rerender(
      <label>
        Accounts
        <span className="inline-grid ml-2">
          <Checkbox checked indeterminate={false} onChange={onChange} />
        </span>
      </label>,
    )
    expect(input.indeterminate).toBe(false)
    expect(input.checked).toBe(true)
  })
})
