import { createStore, Provider } from 'jotai'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { metric } from '@/domains/portfolio/features/overview/mocks/comparedMetric.mock'
import { comparison } from '@/domains/portfolio/features/overview/mocks/overviewComparison.mock'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

import { OverviewSummaryCards } from './OverviewSummaryCards.feature'

describe('OverviewSummaryCards', () => {
  it.each<{
    previous: number | null
    status: IrrStatus
    expected: string
  }>([
    { previous: 0, status: 'ready', expected: '+0.00%' },
    { previous: -2.5, status: 'ready', expected: '-2.50%' },
    { previous: null, status: 'ready', expected: '—' },
    { previous: 6.2, status: 'loading', expected: '—' },
    { previous: 6.2, status: 'error', expected: '—' },
  ])(
    'formats previous IRR $previous with status $status',
    ({ previous, status, expected }) => {
      const model = comparison()
      const html = renderToStaticMarkup(
        <Provider store={createStore()}>
          <OverviewSummaryCards
            comparison={model}
            heldConcentration={model.heldConcentration}
            underlyingConcentration={model.lookThroughConcentration}
            rollingThreeYearTri={metric(8.42, previous)}
            irrStatus={status}
          />
        </Provider>,
      )
      const irrDetail = html.slice(html.indexOf('IRR · trailing 3y'))
      expect(irrDetail.match(/Previous <span[^>]*>([^<]*)<\/span>/u)?.[1]).toBe(
        expected,
      )
    },
  )

  it('renders four accessible drill-down cards with comparison context', () => {
    const model = comparison()
    const html = renderToStaticMarkup(
      <Provider store={createStore()}>
        <OverviewSummaryCards
          comparison={model}
          heldConcentration={model.heldConcentration}
          underlyingConcentration={model.lookThroughConcentration}
          rollingThreeYearTri={metric(8.42, 6.2)}
          irrStatus="ready"
        />
      </Provider>,
    )

    expect(html.match(/aria-label="Open [^"]+ details"/g)).toHaveLength(4)
    expect(html).toContain('Open Portfolio value details')
    expect(html).toContain('Open Net contributions details')
    expect(html).toContain('Open Performance &amp; income details')
    expect(html).toContain('Open Concentration details')
    expect(html).toContain('IRR · trailing 3y')
    expect(html).toContain('+2.2 pp')
    expect(html).toMatch(/Previous <span[^>]*>\+6\.20%<\/span>/u)
    expect(html).toContain('-2.0 pp')
    expect(html).toContain('Underlying assets')
    expect(html).toContain('Held positions · largest 24.0% · top five 62.0%')
    expect(html).not.toContain('identified assets')
    expect(html).not.toContain('coverage')
    expect(html).not.toContain('partial view')
  })

  it('shows unavailable states instead of zeroes for missing historical metrics', () => {
    const model = comparison()
    model.value = metric(null, null)
    model.heldConcentration = {
      current: null,
      previous: null,
      topHolding: metric(null, null),
      topFive: metric(null, null),
    }
    model.lookThroughConcentration = model.heldConcentration
    const html = renderToStaticMarkup(
      <Provider store={createStore()}>
        <OverviewSummaryCards
          comparison={model}
          heldConcentration={model.heldConcentration}
          underlyingConcentration={model.lookThroughConcentration}
          rollingThreeYearTri={metric(null, null)}
          irrStatus="error"
        />
      </Provider>,
    )

    expect(html).toMatch(/Previous <span[^>]*>Unavailable<\/span>/u)
    expect(html).toContain(
      'Underlying detail unavailable · showing held positions',
    )
  })
})
