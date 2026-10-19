import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  CumulativeConcentrationTooltip,
} from './CumulativeConcentrationChart'
import {
  cumulativeConcentrationCrosshair,
  type CumulativeConcentrationPoint,
} from './portfolioCharts.logic'

const point: CumulativeConcentrationPoint = {
  rank: 7,
  label: 'Example asset',
  name: 'Example asset',
  value: 12_500,
  weight: 4.25,
  cumulativeWeight: 70.5,
}

describe('CumulativeConcentrationChart helpers', () => {
  it('renders the rank, cumulative share and marginal holding in the tooltip', () => {
    const html = renderToStaticMarkup(
      <CumulativeConcentrationTooltip active payload={[{ payload: point }]} />,
    )

    expect(html).toContain('Top 7 assets · 70.5%')
    expect(html).toContain('#7 Example asset')
    expect(html).toContain('4.3%')
  })

  it('uses the active rank and cumulative share for the dotted crosshair', () => {
    expect(cumulativeConcentrationCrosshair(point)).toEqual({ x: 7, y: 70.5 })
    expect(cumulativeConcentrationCrosshair(null)).toBeNull()
  })
})
