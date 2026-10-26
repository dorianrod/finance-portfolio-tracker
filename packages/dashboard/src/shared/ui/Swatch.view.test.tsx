import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'

describe('swatches', () => {
  it('owns series appearance while retaining the supplied dimensions', () => {
    const html = renderToStaticMarkup(
      <span className="inline-block h-2 w-3">
        <SeriesSwatch as="i" tone={'series1'} shape="bar" />
      </span>,
    )
    expect(html).toContain('<i')
    expect(html).toContain('background-color:#3b82f6')
    expect(html).toContain('rounded-sm')
    expect(html).toContain('h-2 w-3')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('tone=')
  })

  it('renders a supplied palette role without interpreting business data', () => {
    const html = renderToStaticMarkup(
      <SeriesSwatch tone="series1" shape="dot" />,
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
