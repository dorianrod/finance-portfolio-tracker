import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/concentrationCalculations.types'

import { CumulativeConcentrationTooltip } from './CumulativeConcentrationTooltip.view'

const point: CumulativeConcentrationPoint = {
  rank: 7,
  label: 'Example asset',
  name: 'Example asset',
  value: 12_500,
  weight: 4.25,
  cumulativeWeight: 70.5,
}

describe('CumulativeConcentrationTooltip', () => {
  it.each([
    [1, 'Top 1 asset'],
    [2, 'Top 2 assets'],
  ])('pluralizes the asset count %s', (rank, expected) => {
    const html = renderToStaticMarkup(
      <CumulativeConcentrationTooltip
        active
        payload={[{ payload: { ...point, rank } }]}
      />,
    )
    expect(html).toContain(expected)
  })

  it('renders the rank, cumulative share and marginal holding', () => {
    const html = renderToStaticMarkup(
      <CumulativeConcentrationTooltip active payload={[{ payload: point }]} />,
    )

    expect(html).toContain('Top 7 assets · 70.5%')
    expect(html).toContain('#7 Example asset')
    expect(html).toContain('4.3%')
  })
})
