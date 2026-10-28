// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox.view'

afterEach(cleanup)

describe('Checkbox', () => {
  it('synchronizes native indeterminate state and preserves selection actions', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <label>
        Accounts
        <span className="inline-grid ml-2">
          <Checkbox checked={false} indeterminate onChange={onChange} />
        </span>
      </label>,
    )
    const input = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'Accounts',
    })
    expect(input.indeterminate).toBe(true)
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
