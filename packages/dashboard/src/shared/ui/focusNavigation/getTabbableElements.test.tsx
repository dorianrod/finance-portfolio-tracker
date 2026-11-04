// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { getTabbableElements } from './getTabbableElements'

afterEach(cleanup)

describe('getTabbableElements', () => {
  it('returns available controls in keyboard navigation order', () => {
    const { container } = render(
      <>
        <button>Default order</button>
        <button tabIndex={2}>Second priority</button>
        <button tabIndex={1}>First priority</button>
        <button tabIndex={-1}>Programmatic only</button>
        <button disabled>Unavailable</button>
      </>,
    )
    expect(getTabbableElements(container)).toEqual([
      screen.getByRole('button', { name: 'First priority' }),
      screen.getByRole('button', { name: 'Second priority' }),
      screen.getByRole('button', { name: 'Default order' }),
    ])
  })

  it.each([
    { visibility: 'hidden' as const },
    { visibility: 'collapse' as const },
  ])('excludes controls with visibility=$visibility', ({ visibility }) => {
    const { container } = render(
      <button style={{ visibility }}>Unavailable</button>,
    )
    expect(getTabbableElements(container)).toEqual([])
  })

  it('returns no controls for static content', () => {
    const { container } = render(<p>Details</p>)
    expect(getTabbableElements(container)).toEqual([])
  })
})
