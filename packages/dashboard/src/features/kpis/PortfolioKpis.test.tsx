import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { IrrSinceTrackingKpi, TrailingThreeYearIrrKpi } from './PortfolioKpis'

describe('filtered IRR KPIs', () => {
  it('labels a successfully calculated account scope', () => {
    const html = renderToStaticMarkup(
      <IrrSinceTrackingKpi value={12.74} status="ready" scopeLabel="Selected accounts" />,
    )

    expect(html).toContain('IRR since tracking · selected accounts')
    expect(html).toContain('+12.74%')
  })

  it('does not expose a stale value while calculating', () => {
    const html = renderToStaticMarkup(
      <TrailingThreeYearIrrKpi value={17.95} status="loading" scopeLabel="Selected accounts" />,
    )

    expect(html).toContain('Calculating…')
    expect(html).not.toContain('17.95')
  })

  it('shows a clear unavailable state', () => {
    const html = renderToStaticMarkup(
      <IrrSinceTrackingKpi value={null} status="error" />,
    )

    expect(html).toContain('Filtered IRR unavailable')
  })
})
