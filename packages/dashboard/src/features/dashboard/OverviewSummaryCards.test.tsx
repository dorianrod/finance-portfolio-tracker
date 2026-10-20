import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { OverviewComparison } from './overviewComparison.logic'
import { OverviewSummaryCards } from './OverviewSummaryCards'

const metric = (current: number | null, previous: number | null) => ({
  current,
  previous,
  delta: current == null || previous == null ? null : current - previous,
  deltaPct: current == null || previous == null || previous === 0
    ? null
    : ((current - previous) / Math.abs(previous)) * 100,
})

function comparison(): OverviewComparison {
  const concentration = {
    current: {
      date: '2026-10-20',
      topHoldingPct: 24,
      topFivePct: 62,
      coveragePct: 88,
      holdings: [{ key: 'A', label: 'AAA', name: 'Asset A', value: 240, weight: 24 }],
    },
    previous: {
      date: '2025-10-20',
      topHoldingPct: 26,
      topFivePct: 65,
      coveragePct: 86,
      holdings: [{ key: 'A', label: 'AAA', name: 'Asset A', value: 260, weight: 26 }],
    },
    topHolding: metric(24, 26),
    topFive: metric(62, 65),
  }
  return {
    windows: {
      current: { start: '2025-10-21', end: '2026-10-20' },
      previous: { start: '2024-10-21', end: '2025-10-20' },
      defaultedToTrailingYear: true,
    },
    value: metric(120_000, 100_000),
    contributions: metric(15_000, 12_000),
    marketPerformance: metric(5_000, 3_000),
    passiveIncome: metric(800, 650),
    valueHistory: [],
    heldConcentration: concentration,
    lookThroughConcentration: concentration,
  }
}

describe('OverviewSummaryCards', () => {
  it('renders four accessible drill-down cards with comparison context', () => {
    const model = comparison()
    const html = renderToStaticMarkup(
      <OverviewSummaryCards
        comparison={model}
        heldConcentration={model.heldConcentration}
        underlyingConcentration={model.lookThroughConcentration}
        globalTri={8.42}
        irrStatus="ready"
        onNavigate={() => undefined}
      />,
    )

    expect(html.match(/type="button"/g)).toHaveLength(4)
    expect(html).toContain('Open Portfolio value details')
    expect(html).toContain('Open Net contributions details')
    expect(html).toContain('Open Performance &amp; income details')
    expect(html).toContain('Open Concentration details')
    expect(html).toContain('IRR since tracking')
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
      <OverviewSummaryCards
        comparison={model}
        heldConcentration={model.heldConcentration}
        underlyingConcentration={model.lookThroughConcentration}
        globalTri={null}
        irrStatus="error"
        onNavigate={() => undefined}
      />,
    )

    expect(html).toContain('Previous <span class="font-medium tabular-nums text-gray-400">Unavailable</span>')
    expect(html).toContain('Underlying detail unavailable · showing held positions')
  })
})
