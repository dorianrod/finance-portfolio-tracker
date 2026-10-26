import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CategorySwatch, SeriesSwatch, ToneSwatch } from './Swatch.view'

describe('swatches', () => {
  it('owns series appearance while retaining the supplied dimensions', () => {
    const html = renderToStaticMarkup(
      <span className="inline-block h-2 w-3">
        <SeriesSwatch as="i" tone="netContributions" shape="bar" />
      </span>,
    )
    expect(html).toContain('<i')
    expect(html).toContain('background-color:#3b82f6')
    expect(html).toContain('rounded-sm')
    expect(html).toContain('h-2 w-3')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('tone=')
  })

  it('resolves category colors in the shared layer', () => {
    const html = renderToStaticMarkup(
      <CategorySwatch category="france" shape="dot" />,
    )
    expect(html).toContain('background-color:#3b82f6')
    expect(html).toContain('rounded-full')
  })

  it('uses semantic theme utilities for UI indicators', () => {
    const html = renderToStaticMarkup(<ToneSwatch tone="warning" shape="dot" />)
    expect(html).toContain('bg-warning')
    expect(html).toContain('rounded-full')
  })
})
