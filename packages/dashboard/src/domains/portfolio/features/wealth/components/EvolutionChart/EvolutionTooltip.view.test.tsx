// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EvolutionTooltip } from './EvolutionTooltip.view'
import { makePortfolioCompositionPoint } from './mocks/portfolioCompositionPoint.mock'

afterEach(cleanup)

describe('EvolutionTooltip', () => {
  it('renders prepared totals and signed shares without raw history fields', () => {
    const point = makePortfolioCompositionPoint({
      composition: {
        cost: 125,
        gain: -25,
        total: 100,
        costShare: 125,
        gainShare: -25,
      },
    })
    render(
      <EvolutionTooltip
        active
        percentageMode
        payload={[{ payload: point }]}
        label={point.date}
      />,
    )

    expect(screen.getByText('Total: 100 €')).toBeTruthy()
    expect(screen.getByText('Cost basis: 125 € · 125.0%')).toBeTruthy()
    expect(screen.getByText('Unrealized P&L: -25 € · -25.0%')).toBeTruthy()
  })

  it('preserves the zero display for a missing library payload', () => {
    render(<EvolutionTooltip active percentageMode payload={[{}]} />)
    expect(screen.getByText('Total: 0 €')).toBeTruthy()
    expect(screen.getByText('Cost basis: 0 € · —')).toBeTruthy()
  })

  it.each([
    { active: false, payload: [{ payload: makePortfolioCompositionPoint() }] },
    { active: true, payload: [] },
    { active: true },
  ])('hides an inactive or unavailable tooltip: %j', (props) => {
    render(<EvolutionTooltip {...props} />)
    expect(screen.queryByText(/^Total:/)).toBeNull()
  })
})
