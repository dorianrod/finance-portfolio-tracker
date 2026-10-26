import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Text } from './Text.view'

describe('Text', () => {
  it('renders semantic typography and tone with caller layout and nested children', () => {
    const html = renderToStaticMarkup(
      <Text
        as="h2"
        variant="sectionHeading"
        tone="subtle"
        className="mb-3 flex gap-2"
      >
        Summary<strong>details</strong>
      </Text>,
    )
    expect(html).toContain('<h2')
    expect(html).toContain(
      'text-lg font-semibold text-content-subtle mb-3 flex gap-2',
    )
    expect(html).toContain('Summary<strong>details</strong></h2>')
  })

  it('preserves native table attributes and numeric display semantics', () => {
    const html = renderToStaticMarkup(
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
      </Text>,
    )
    expect(html).toContain('colSpan="2"')
    expect(html).toContain(
      'text-xs text-positive text-right tabular-nums truncate',
    )
    expect(html).not.toContain('numeric=')
    expect(html).not.toContain('variant=')
  })
})
