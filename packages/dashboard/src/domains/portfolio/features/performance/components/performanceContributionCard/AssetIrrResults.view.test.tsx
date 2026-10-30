// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { assetIrr } from '@/domains/portfolio/features/performance/mocks/assetIrrSummary.mock'

import { AssetIrrResultsView } from './AssetIrrResults.view'

afterEach(cleanup)
describe('AssetIrrResultsView', () => {
  it('renders supplied rankings, period and caller-owned metric label', () => {
    const data = assetIrr()
    render(
      <AssetIrrResultsView
        measuredCount={2}
        topReturns={data.assets.slice(0, 1)}
        underperformers={data.assets.slice(1)}
        startDate={data.start_date}
        endDate={data.end_date}
      >
        <span>Measured assets</span>
      </AssetIrrResultsView>,
    )
    expect(screen.getByText('Measured assets')).toBeDefined()
    expect(screen.getByText('Winner')).toBeDefined()
    expect(screen.getByText('Loser')).toBeDefined()
    expect(screen.getByText('12 Oct 2025 – 12 Oct 2026')).toBeDefined()
  })
  it('shows empty ranking and unavailable period feedback', () => {
    render(
      <AssetIrrResultsView
        measuredCount={0}
        topReturns={[]}
        underperformers={[]}
        startDate={null}
        endDate={null}
      >
        <span>Measured assets</span>
      </AssetIrrResultsView>,
    )
    expect(screen.getByText('No positive IRR')).toBeDefined()
    expect(screen.getByText('No negative IRR')).toBeDefined()
    expect(screen.getByText('Not available')).toBeDefined()
  })
})
