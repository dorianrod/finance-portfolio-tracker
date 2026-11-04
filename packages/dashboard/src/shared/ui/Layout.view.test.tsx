// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/shared/ui/controls/Button.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Stack } from '@/shared/ui/layout/Stack.view'

import { Text } from './Text.view'

afterEach(cleanup)

describe('standardized UI composition', () => {
  it.each([
    { size: 'compact' as const },
    { size: 'default' as const },
    { size: 'large' as const },
  ])(
    'preserves the accessible action at the $size button size',
    async ({ size }) => {
      const onClick = vi.fn()
      render(
        <div className="mt-3">
          <Button size={size} onClick={onClick}>
            <Text>Save</Text>
          </Button>
        </div>,
      )
      const button = screen.getByRole('button', { name: 'Save' })
      await userEvent.setup().click(button)
      expect(onClick).toHaveBeenCalledOnce()
    },
  )

  it('preserves table semantics when standard insets own cell padding', () => {
    render(
      <table>
        <tbody>
          <tr>
            <Inset as="td" colSpan={2}>
              <Text>Value</Text>
            </Inset>
          </tr>
        </tbody>
      </table>,
    )
    expect(
      screen.getByRole('cell', { name: 'Value' }).getAttribute('colspan'),
    ).toBe('2')
  })

  it('keeps nested content visible through standard structure primitives', () => {
    render(
      <Stack>
        <Text>Title</Text>
        <Inset>
          <Text>Details</Text>
        </Inset>
      </Stack>,
    )
    expect(screen.getByText('Title')).toBeTruthy()
    expect(screen.getByText('Details')).toBeTruthy()
  })
})
