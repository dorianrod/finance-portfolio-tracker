import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Inline } from '@/shared/ui/layout/Inline.view'

import { Text } from './Text.view'

describe('Text', () => {
  it('renders semantic typography and tone with parent layout and nested children', () => {
    const html = renderToStaticMarkup(
      <div className="mb-3">
        <Text as="h2" variant="sectionHeading" tone="subtle">
          <Inline as="span" gap="default">
            Summary<strong>details</strong>
          </Inline>
        </Text>
      </div>,
    )
    expect(html).toContain('<h2')
    expect(html).toContain('text-lg font-semibold text-content-subtle')
    expect(html).toContain('<div class="mb-3">')
    expect(html).toContain('<span class="inline-flex gap-2 items-center">')
    expect(html).toContain('Summary<strong>details</strong></span></h2>')
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
