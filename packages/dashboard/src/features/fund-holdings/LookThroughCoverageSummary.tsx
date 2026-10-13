import type { FundCoverageReport } from '@/hooks/useFundHoldings'
import { fmtFull } from '@/shared/format/money'

export function LookThroughCoverageSummary({ report, compact = false }: {
  report: FundCoverageReport | null
  compact?: boolean
}) {
  if (!report) return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">
      No look-through quality report. Run the portfolio pipeline to generate it.
    </div>
  )
  const cards = [
    { label: 'ETF/fund A+B coverage', value: `${report.fundCoveragePct.toFixed(1)}%`, detail: fmtFull(report.highConfidenceExplainedValue) },
    { label: 'Whole portfolio coverage', value: `${report.portfolioCoveragePct.toFixed(1)}%`, detail: 'Direct securities + A/B look-through' },
    { label: 'Decomposed funds', value: fmtFull(report.decomposedValue), detail: `of ${fmtFull(report.fundValue)}` },
    { label: 'Fund remainder', value: fmtFull(report.undisclosedFundValue), detail: 'Missing or undisclosed' },
    { label: 'Intrinsically opaque', value: fmtFull(report.opaqueValue), detail: 'No market identifier' },
    { label: 'Feasibility gate', value: report.feasibilityStatus === 'passed' ? 'Passed' : report.feasibilityStatus === 'pending_repeatability' ? 'Pending' : 'Limited', detail: report.repeatabilityGatePass ? 'Repeatability verified' : 'Needs two successful refreshes' },
  ]
  return (
    <div className={`grid grid-cols-1 gap-3 ${compact ? 'md:grid-cols-3 xl:grid-cols-6' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-600">{card.label}</div>
          <div className="mt-1.5 text-xl font-semibold tabular-nums text-white">{card.value}</div>
          <div className="mt-1 text-xs text-gray-500">{card.detail}</div>
        </div>
      ))}
    </div>
  )
}
