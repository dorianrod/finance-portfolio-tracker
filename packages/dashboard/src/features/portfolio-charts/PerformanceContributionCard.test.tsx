import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AssetIrrView, PerformanceContributionCard } from './PerformanceContributionCard'
import type { AssetIrrSummary } from '@/hooks/useAssetIrr'
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

function assetIrr(overrides: Partial<AssetIrrSummary> = {}): AssetIrrSummary {
  return {
    available: true,
    start_date: '2025-10-12',
    end_date: '2026-10-12',
    assets: [
      { key: 'win', label: 'WIN', name: 'Winner', irr: 20, value: 1200, accounts: ['PEA'], account_types: ['PEA'] },
      { key: 'small', label: 'SMALL', name: 'Small winner', irr: 5, value: 525, accounts: ['CTO'], account_types: ['CTO'] },
      { key: 'lose', label: 'LOSE', name: 'Loser', irr: -10, value: 900, accounts: ['PEA'], account_types: ['PEA'] },
    ],
    ...overrides,
  }
}

describe('PerformanceContributionCard', () => {
  it('uses the same ranked-list visual for positive and negative IRRs', () => {
    const html = renderToStaticMarkup(
      <AssetIrrView summary={assetIrr()} status="ready" />,
    )

    expect(html).toContain('IRR method')
    expect(html).toContain('Money-weighted')
    expect(html).toContain('Assets measured')
    expect(html).toContain('12 Oct 2025 – 12 Oct 2026')
    expect(html).toContain('Top IRRs')
    expect(html).toContain('Lowest IRRs')
    expect(html).toContain('WIN')
    expect(html).toContain('+20.00%')
    expect(html).toContain('Value 1,200 €')
    expect(html).toContain('LOSE')
    expect(html).toContain('-10.00%')
    expect(html).toContain('Value 900 €')
  })

  it('renders IRR context, attributed performance and both contribution lists', () => {
    const html = renderToStaticMarkup(
      <PerformanceContributionCard
        assetIrr={assetIrr()}
        assetIrrStatus="ready"
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y', startDate: '2023-09-30' })}
        sinceTrackingIrr={12.34}
        trailingThreeYearIrr={8.5}
        irrStatus="ready"
      />,
    )

    expect(html).toContain('Performance by asset')
    expect(html).toContain('Contribution €')
    expect(html).toContain('IRR %')
    expect(html).toContain('+12.34%')
    expect(html).toContain('Attributed net performance')
    expect(html).toContain('AAA')
    expect(html).toContain('BBB')
  })

  it('disables the trailing view when three years of history are unavailable', () => {
    const html = renderToStaticMarkup(
      <PerformanceContributionCard
        assetIrr={assetIrr()}
        assetIrrStatus="ready"
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
        assetIrr={assetIrr()}
        assetIrrStatus="ready"
        sinceTracking={summary()}
        trailingThreeYears={summary({ horizon: 'trailing-3y' })}
        sinceTrackingIrr={12.34}
        trailingThreeYearIrr={8.5}
        irrStatus="loading"
      />,
    )
    const error = renderToStaticMarkup(
      <PerformanceContributionCard
        assetIrr={assetIrr()}
        assetIrrStatus="ready"
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

  it('shows asset IRR loading and unavailable states', () => {
    const loading = renderToStaticMarkup(<AssetIrrView summary={assetIrr()} status="loading" />)
    const unavailable = renderToStaticMarkup(
      <AssetIrrView summary={assetIrr({ available: false, assets: [] })} status="ready" />,
    )

    expect(loading).toContain('Calculating asset IRR')
    expect(unavailable).toContain('Asset IRR is not available')
  })
})
