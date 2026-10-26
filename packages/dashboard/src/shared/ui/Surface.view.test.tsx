import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Surface } from './Surface.view'

describe('Surface', () => {
  it('owns appearance while retaining caller layout and native semantics', () => {
    const html = renderToStaticMarkup(
      <Surface
        as="section"
        variant="contentCard"
        tone="muted"
        className="flex-1 p-4"
      >
        Content
      </Surface>,
    )
    expect(html).toContain('<section')
    expect(html).toContain(
      'bg-surface border border-border rounded-xl text-sm text-content-muted flex-1 p-4',
    )
    expect(html).toContain('Content</section>')
    expect(html).not.toContain('variant=')
    expect(html).not.toContain('tone=')
  })
})
