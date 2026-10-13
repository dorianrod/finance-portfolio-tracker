import { useState } from 'react'
import { fmt, fmtFull, fmtPct } from '@/shared/format/money'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type { ConcentrationSummary, PeriodDrivers } from '@/features/portfolio-charts/portfolioCharts.logic'
import { ConcentrationModeToggle, type ConcentrationMode } from '@/features/portfolio-charts/ConcentrationModeToggle'

export function VariationCard({ drivers, heldAssetConcentration, lookThroughConcentration, periodLabel }: {
  drivers: PeriodDrivers
  heldAssetConcentration: ConcentrationSummary
  lookThroughConcentration: ConcentrationSummary
  periodLabel: string
}) {
  const [concentrationMode, setConcentrationMode] = useState<ConcentrationMode>('held')
  const concentration = concentrationMode === 'held' ? heldAssetConcentration : lookThroughConcentration
  const totalMagnitude = Math.abs(drivers.savings) + Math.abs(drivers.performance)
  const savingsWidth = totalMagnitude > 0 ? Math.abs(drivers.savings) / totalMagnitude * 100 : 50
  const performanceWidth = 100 - savingsWidth

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-xl bg-gray-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-300">Change explained</h2>
            {periodLabel && <p className="mt-0.5 text-xs text-gray-600">{periodLabel}</p>}
          </div>
          <div className={`text-right text-xl font-semibold tabular-nums ${drivers.change >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}>{fmt.format(drivers.change)}</div>
        </div>
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-gray-800">
          <div style={{ width: `${savingsWidth}%`, backgroundColor: SEMANTIC_COLORS.netContributions }} />
          <div style={{ width: `${performanceWidth}%`, backgroundColor: drivers.performance >= 0 ? SEMANTIC_COLORS.performancePositive : SEMANTIC_COLORS.performanceNegative }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-xs text-gray-600">Net contributions</div><div className={`mt-1 font-medium ${SEMANTIC_TEXT_CLASSES.netContributions}`}>{fmt.format(drivers.savings)}</div></div>
          <div><div className="text-xs text-gray-600">Market performance</div><div className={`mt-1 font-medium ${drivers.performance >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}>{fmt.format(drivers.performance)}</div></div>
        </div>
      </section>

      <section className="rounded-xl bg-gray-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-gray-300">Concentration snapshot</h2>
            <p className="mt-0.5 text-xs text-gray-600">{concentrationMode === 'held' ? 'Assets effectively held, at allocation-file grain.' : 'Look-through exposure to direct and fund holdings.'}</p>
          </div>
          <ConcentrationModeToggle value={concentrationMode} onChange={setConcentrationMode} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div><div className="text-xs text-gray-600">Largest holding</div><div className={`mt-1 text-xl font-semibold ${SEMANTIC_TEXT_CLASSES.risk}`}>{fmtPct(concentration.topHoldingPct)}</div></div>
          <div><div className="text-xs text-gray-600">Top five holdings</div><div className={`mt-1 text-xl font-semibold ${SEMANTIC_TEXT_CLASSES.riskSecondary}`}>{fmtPct(concentration.topFivePct)}</div></div>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3 rounded-lg bg-gray-950/50 px-3 py-2">
          <span className="text-xs text-gray-500">Top 10 total</span>
          <span className="text-sm font-semibold tabular-nums text-gray-200">{fmtFull(concentration.topTenValue)} <span className="ml-1 text-gray-500">· {concentration.topTenPct.toFixed(1)}%</span></span>
        </div>
        {concentration.holdings[0] && <div className="mt-4 flex gap-3 border-t border-gray-800 pt-3 text-xs text-gray-500"><span className="min-w-0 truncate">Largest: <span className="text-gray-300">{concentration.holdings[0].name}</span></span><span className="ml-auto shrink-0">{concentrationMode === 'held' ? 'Allocation-file level' : `Coverage: ${fmtPct(concentration.coveragePct)}`}</span></div>}
      </section>
    </div>
  )
}
