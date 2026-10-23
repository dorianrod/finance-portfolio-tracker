import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CumulativeConcentrationTooltip } from './CumulativeConcentrationTooltip.view'
import type { CumulativeConcentrationPoint } from './helpers/calculators/calculatePortfolioCharts'

const point: CumulativeConcentrationPoint = {
  rank: 7,
  label: 'Example asset',
  name: 'Example asset',
  value: 12_500,
  weight: 4.25,
  cumulativeWeight: 70.5,
}

describe('CumulativeConcentrationTooltip', () => {
  it('renders the rank, cumulative share and marginal holding', () => {
    const html = renderToStaticMarkup(
      <CumulativeConcentrationTooltip active payload={[{ payload: point }]} />,
    )

    expect(html).toContain('Top 7 assets · 70.5%')
    expect(html).toContain('#7 Example asset')
    expect(html).toContain('4.3%')
  })
})
