import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AnnualConcentrationFrame, HistoricalConcentrationPoint } from './concentrationTrend.logic'
import { nextPlaybackIndex, shouldAnimateConcentration } from './concentrationTrend.logic'
import { ConcentrationTrendSection } from './ConcentrationTrendSection'

const points: HistoricalConcentrationPoint[] = [
  { date: '2024-12-31', positionsTo25Pct: 1, positionsTo50Pct: 1, positionsTo75Pct: 2, positionsTo90Pct: 2, effectiveCount: 1.92, holdingCount: 2, holdings: [] },
  { date: '2025-12-31', positionsTo25Pct: 1, positionsTo50Pct: 1, positionsTo75Pct: 2, positionsTo90Pct: 2, effectiveCount: 2, holdingCount: 2, holdings: [] },
]

const frames: AnnualConcentrationFrame[] = points.map((point) => ({
  ...point,
  year: Number(point.date.slice(0, 4)),
  holdings: [{ key: 'A', label: 'AAA', name: 'Asset A', value: 100, weight: 50 }],
}))

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
    const html = renderToStaticMarkup(<ConcentrationTrendSection points={points} annualFrames={frames} />)

    expect(html).toContain('Held-position concentration')
    expect(html).toContain('Minimum positions to reach portfolio share')
    expect(html).toContain('Minimum number of largest positions needed to reach each share of the portfolio.')
    expect(html).toContain('Largest holdings over time')
    expect(html).not.toContain('Effective positions')
    expect(html).toContain('aria-label="Play concentration history"')
    expect(html).toContain('aria-label="Concentration year"')
    expect(html.indexOf('aria-label="Play concentration history"')).toBeLessThan(html.indexOf('aria-label="Previous concentration year"'))
    expect(html.indexOf('aria-label="Previous concentration year"')).toBeLessThan(html.indexOf('aria-label="Next concentration year"'))
  })

  it('renders a focused empty state with fewer than two snapshots', () => {
    const html = renderToStaticMarkup(<ConcentrationTrendSection points={points.slice(0, 1)} annualFrames={frames.slice(0, 1)} />)
    expect(html).toContain('Not enough concentration history for the current selection.')
    expect(html).not.toContain('Play concentration history')
  })
})
