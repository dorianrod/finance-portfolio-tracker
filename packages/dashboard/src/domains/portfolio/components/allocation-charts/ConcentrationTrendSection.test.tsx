import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { HistoricalConcentrationPoint } from './concentrationTrend.logic'
import { nextPlaybackIndex, shouldAnimateConcentration } from './concentrationTrend.logic'
import { ConcentrationTrendSection } from './ConcentrationTrendSection'

const points: HistoricalConcentrationPoint[] = [
  { date: '2024-12-31', positionsTo25Pct: 1, positionsTo50Pct: 1, positionsTo75Pct: 2, positionsTo90Pct: 2, effectiveCount: 1.92, holdingCount: 2, coveragePct: 100, identifiedValue: 200, undisclosedValue: 0, opaqueValue: 0, selectedValue: 200, holdings: [] },
  { date: '2025-01-31', positionsTo25Pct: 1, positionsTo50Pct: 1, positionsTo75Pct: 2, positionsTo90Pct: 2, effectiveCount: 2, holdingCount: 2, coveragePct: 100, identifiedValue: 200, undisclosedValue: 0, opaqueValue: 0, selectedValue: 200, holdings: [] },
]

describe('ConcentrationTrendSection helpers', () => {
  it('advances playback and reports completion at the last frame', () => {
    expect(nextPlaybackIndex(0, 3)).toEqual({ index: 1, complete: false })
    expect(nextPlaybackIndex(1, 3)).toEqual({ index: 2, complete: true })
    expect(nextPlaybackIndex(2, 3)).toEqual({ index: 2, complete: true })
  })

  it('disables chart transitions when reduced motion is preferred', () => {
    expect(shouldAnimateConcentration(false)).toBe(true)
    expect(shouldAnimateConcentration(true)).toBe(false)
  })
})

describe('ConcentrationTrendSection', () => {
  it('renders trend charts and accessible playback controls', () => {
    const html = renderToStaticMarkup(<ConcentrationTrendSection heldPoints={points} lookThroughPoints={points} lookThroughAvailable />)

    expect(html).toContain('Held-position concentration')
    expect(html).toContain('Minimum positions to reach portfolio share')
    expect(html).toContain('Unavailable thresholds appear as gaps')
    expect(html).toContain('Largest holdings over time')
    expect(html).toContain('Held positions')
    expect(html).toContain('Underlying assets')
    expect(html).toContain('aria-label="Play concentration history"')
    expect(html).toContain('aria-label="Concentration month"')
    expect(html.indexOf('aria-label="Play concentration history"')).toBeLessThan(html.indexOf('aria-label="Previous concentration month"'))
    expect(html.indexOf('aria-label="Previous concentration month"')).toBeLessThan(html.indexOf('aria-label="Next concentration month"'))
  })

  it('renders a focused empty state with fewer than two snapshots', () => {
    const html = renderToStaticMarkup(<ConcentrationTrendSection heldPoints={points.slice(0, 1)} lookThroughPoints={[]} lookThroughAvailable={false} />)
    expect(html).toContain('Not enough concentration history for the current selection.')
    expect(html).toContain('fund_holdings_history.csv')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('Play concentration history')
  })
})
