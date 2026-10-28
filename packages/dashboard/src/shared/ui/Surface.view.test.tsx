// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Surface } from './Surface.view'

afterEach(cleanup)

describe('Surface', () => {
  it('preserves native article semantics and composed content', () => {
    render(
      <div className="flex-1">
        <Surface as="article" variant="contentCard" tone="muted">
          <h2>Summary</h2>
          Content
        </Surface>
      </div>,
    )
    const article = screen.getByRole('article')
    expect(
      within(article).getByRole('heading', { name: 'Summary' }),
    ).toBeTruthy()
    expect(within(article).getByText('Content')).toBeTruthy()
  })
})
