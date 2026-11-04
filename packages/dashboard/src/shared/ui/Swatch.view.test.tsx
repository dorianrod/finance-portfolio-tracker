import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'

describe('swatches', () => {
  it('keeps a series swatch decorative', () => {
    const html = renderToStaticMarkup(
      <span className="inline-block h-2 w-3">
        <SeriesSwatch as="i" tone={'series1'} shape="bar" />
      </span>,
    )
    expect(html).toContain('background-color:#3b82f6')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('tone=')
  })

  it('renders a supplied palette role without interpreting business data', () => {
    const html = renderToStaticMarkup(
      <SeriesSwatch tone="series1" shape="dot" />,
    )
    expect(html).toContain('background-color:#3b82f6')
    expect(html).toContain('aria-hidden="true"')
  })

  it('keeps a semantic UI indicator decorative', () => {
    const html = renderToStaticMarkup(<ToneSwatch tone="warning" shape="dot" />)
    expect(html).toContain('aria-hidden="true"')
  })
})
