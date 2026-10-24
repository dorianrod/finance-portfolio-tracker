// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ExternalLink } from './ExternalLink.view'

afterEach(cleanup)

describe('ExternalLink', () => {
  it('isolates the new tab from the opener and referrer', () => {
    render(
      <ExternalLink href="https://example.com/source">
        Official source
      </ExternalLink>,
    )
    const link = screen.getByRole('link', { name: 'Official source' })
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
  it.each(['', 'javascript:alert(1)', 'data:text/html,test', 'not-a-url'])(
    'renders %s as plain text',
    (href) => {
      render(<ExternalLink href={href}>Source unavailable</ExternalLink>)
      expect(screen.queryByRole('link')).toBeNull()
      expect(screen.getByText('Source unavailable')).toBeTruthy()
    },
  )
})
