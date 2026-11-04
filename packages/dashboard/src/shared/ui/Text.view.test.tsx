// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Inline } from '@/shared/ui/layout/Inline.view'

import { Text } from './Text.view'

afterEach(cleanup)

describe('Text', () => {
  it('renders semantic typography and tone with parent layout and nested children', () => {
    render(
      <div className="mb-3">
        <Text as="h2" variant="sectionHeading" tone="subtle">
          <Inline as="span" gap="default">
            Summary <strong>details</strong>
          </Inline>
        </Text>
      </div>,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Summary details' }),
    ).toBeTruthy()
  })

  it('preserves native table attributes and numeric display semantics', () => {
    render(
      <table>
        <tbody>
          <tr>
            <Text
              as="td"
              colSpan={2}
              variant="caption"
              tone="positive"
              align="right"
              numeric
              truncate
            >
              42
            </Text>
          </tr>
        </tbody>
      </table>,
    )
    expect(
      screen.getByRole('cell', { name: '42' }).getAttribute('colspan'),
    ).toBe('2')
  })
})
