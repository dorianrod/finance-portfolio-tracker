import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Surface } from './Surface.view'

describe('Surface', () => {
  it('owns appearance with layout in the caller and native semantics', () => {
    const html = renderToStaticMarkup(
      <div className="flex-1">
        <Surface as="section" variant="contentCard" tone="muted">
          Content
        </Surface>
      </div>,
    )
    expect(html).toContain('<section')
    expect(html).toContain(
      'bg-surface border border-border rounded-xl text-sm p-4 text-content-muted',
    )
    expect(html).toContain('<div class="flex-1">')
    expect(html).toContain('Content</section>')
    expect(html).not.toContain('variant=')
    expect(html).not.toContain('tone=')
  })
})
