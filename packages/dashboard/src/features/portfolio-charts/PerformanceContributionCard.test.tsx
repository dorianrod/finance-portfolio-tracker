import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PerformanceContributionCard } from './PerformanceContributionCard'
import type { PerformanceContributionSummary } from './performanceContribution.logic'

function summary(overrides: Partial<PerformanceContributionSummary> = {}): PerformanceContributionSummary {
  return {
    horizon: 'since-tracking',
    available: true,
    startDate: '2021-01-31',
    endDate: '2026-10-12',
    netContribution: 750,
    positiveTotal: 1000,
    negativeTotal: 250,
    contributors: [{ key: 'a', label: 'AAA', name: 'Asset A', amount: 1000, share: 100, accounts: ['PEA'] }],
    detractors: [{ key: 'b', label: 'BBB', name: 'Asset B', amount: -250, share: 100, accounts: ['CTO'] }],
    ...overrides,
  }
}

describe('PerformanceContributionCard', () => {
  it('renders IRR context, attributed performance and both contribution lists', () => {
    const html = renderToStaticMarkup(
      <PerformanceContributionCard
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y', startDate: '2023-09-30' })}
        sinceTrackingIrr={12.34}
        trailingThreeYearIrr={8.5}
        irrStatus="ready"
      />,
    )

    expect(html).toContain('Contribution to performance')
    expect(html).toContain('+12.34%')
    expect(html).toContain('Attributed net performance')
    expect(html).toContain('AAA')
    expect(html).toContain('BBB')
  })

  it('disables the trailing view when three years of history are unavailable', () => {
    const html = renderToStaticMarkup(
      <PerformanceContributionCard
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y', available: false })}
        sinceTrackingIrr={12.34}
        trailingThreeYearIrr={null}
        irrStatus="ready"
      />,
    )

    expect(html).toContain('disabled=""')
    expect(html).toContain('Three years of history are not yet available')
  })

  it('shows filtered IRR loading and error states without hiding contributions', () => {
    const loading = renderToStaticMarkup(
      <PerformanceContributionCard
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y' })}
        sinceTrackingIrr={12.34}
        trailingThreeYearIrr={8.5}
        irrStatus="loading"
      />,
    )
    const error = renderToStaticMarkup(
      <PerformanceContributionCard
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y' })}
        sinceTrackingIrr={null}
        trailingThreeYearIrr={8.5}
        irrStatus="error"
      />,
    )

    expect(loading).toContain('Calculating…')
    expect(loading).toContain('AAA')
    expect(error).toContain('Unavailable')
    expect(error).toContain('AAA')
  })
})
