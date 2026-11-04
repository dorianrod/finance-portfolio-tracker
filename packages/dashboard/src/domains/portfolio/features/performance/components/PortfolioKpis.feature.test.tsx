import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { IrrSinceTrackingKpi } from '@/domains/portfolio/features/performance/components/portfolioKpis/IrrSinceTrackingKpi.feature'
import { TrailingThreeYearIrrKpi } from '@/domains/portfolio/features/performance/components/portfolioKpis/TrailingThreeYearIrrKpi.feature'
import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

describe('filtered IRR KPIs', () => {
  it('labels a successfully calculated account scope', () => {
    const html = renderToStaticMarkup(
      <IrrSinceTrackingKpi
        value={12.74}
        status="ready"
        accountFilters={new Set(['account'])}
      />,
    )

    expect(html).toContain('IRR since tracking · selected accounts')
    expect(html).toContain('+12.74%')
  })

  it('does not expose a stale value while calculating', () => {
    const html = renderToStaticMarkup(
      <TrailingThreeYearIrrKpi
        history={[makePortfolioHistoryPoint({ tri_rolling_3y: 17.95 })]}
        status="loading"
        accountFilters={new Set(['account'])}
      />,
    )

    expect(html).toContain('Calculating…')
    expect(html).not.toContain('17.95')
  })

  it.each([
    {
      label: 'latest snapshot',
      history: [
        makePortfolioHistoryPoint({ tri_rolling_3y: 91 }),
        makePortfolioHistoryPoint({ tri_rolling_3y: 8.5 }),
      ],
      expected: '+8.50%',
    },
    { label: 'empty history', history: [], expected: '—' },
    {
      label: 'missing latest return',
      history: [
        makePortfolioHistoryPoint({ tri_rolling_3y: 91 }),
        makePortfolioHistoryPoint(),
      ],
      expected: '—',
    },
  ])(
    'renders $label without reusing an older return',
    ({ history, expected }) => {
      const html = renderToStaticMarkup(
        <TrailingThreeYearIrrKpi history={history} />,
      )
      expect(html).toContain(expected)
      expect(html).not.toContain('91.00')
    },
  )

  it('shows a clear unavailable state', () => {
    const html = renderToStaticMarkup(
      <IrrSinceTrackingKpi value={null} status="error" />,
    )

    expect(html).toContain('Filtered IRR unavailable')
  })
})
