import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ChartText } from './ChartText.view'
import { Layout } from './Layout.view'

describe('ChartText', () => {
  it('resolves semantic chart tones and owns section separators while preserving layout', () => {
    const html = renderToStaticMarkup(
      <Layout spaceBefore="compact">
        <ChartText
          as="p"
          tone="performancePositiveText"
          variant="strong"
          separator
        >
          Gain
        </ChartText>
      </Layout>,
    )
    expect(html).toContain('<p')
    expect(html).toContain('color:#4ade80')
    expect(html).toContain('border-top:1px solid var(--tooltip-border)')
    expect(html).toContain('class="mt-1"')
    expect(html).not.toContain('margin-top:')
    expect(html).toContain('font-semibold')
    expect(html).toContain('Gain</p>')
  })

  it('uses the color supplied by a chart series without forwarding series metadata to the DOM', () => {
    const html = renderToStaticMarkup(
      <ChartText series={{ color: '#123456' }}>Series</ChartText>,
    )
    expect(html).toContain('color:#123456')
    expect(html).not.toContain('series=')
  })
})
