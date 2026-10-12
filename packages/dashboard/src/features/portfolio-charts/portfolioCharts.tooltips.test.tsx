import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TriTooltip } from './portfolioCharts.tooltips'

describe('TriTooltip', () => {
  it('labels dotted backfill values as not yet available', () => {
    const html = renderToStaticMarkup(
      <TriTooltip
        active
        label="2021-01-01"
        payload={[
          { dataKey: 'tri_rolling_1y_backfill', value: 8 },
          { dataKey: 'tri_rolling_3y_backfill', value: 7 },
        ]}
      />,
    )

    expect(html).toContain('IRR (1y): Not yet available')
    expect(html).toContain('IRR (3y): Not yet available')
    expect(html).not.toContain('+8.00%')
    expect(html).not.toContain('+7.00%')
  })

  it('shows calculated values once they are available', () => {
    const html = renderToStaticMarkup(
      <TriTooltip
        active
        label="2024-01-01"
        payload={[
          { dataKey: 'tri_rolling_1y', value: 12 },
          { dataKey: 'tri_rolling_3y_backfill', value: 7 },
          { dataKey: 'tri_rolling_3y', value: 7 },
        ]}
      />,
    )

    expect(html).toContain('IRR (1y): +12.00%')
    expect(html).toContain('IRR (3y): +7.00%')
    expect(html).not.toContain('Not yet available')
  })
})
