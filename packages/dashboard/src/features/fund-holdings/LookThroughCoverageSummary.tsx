import type { FundCoverageReport } from '@/hooks/useFundHoldings'
import { fmtFull } from '@/shared/format/money'
import { SEMANTIC_ACCENT_CLASSES, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'

export function LookThroughCoverageSummary({ report, compact = false }: {
  report: FundCoverageReport | null
  compact?: boolean
}) {
  if (!report) return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">
      No look-through quality report. Run the portfolio pipeline to generate it.
    </div>
  )
  const allCards = [
    { label: 'ETF/fund A+B coverage', value: `${report.fundCoveragePct.toFixed(1)}%`, detail: fmtFull(report.highConfidenceExplainedValue) },
    { label: 'Whole portfolio coverage', value: `${report.portfolioCoveragePct.toFixed(1)}%`, detail: 'Direct securities + A/B look-through' },
    { label: 'Decomposed funds', value: fmtFull(report.decomposedValue), detail: `of ${fmtFull(report.fundValue)}` },
    { label: 'Fund remainder', value: fmtFull(report.undisclosedFundValue), detail: 'Missing or undisclosed' },
    { label: 'Intrinsically opaque', value: fmtFull(report.opaqueValue), detail: 'No market identifier' },
    { label: 'Feasibility gate', value: report.feasibilityStatus === 'passed' ? 'Passed' : report.feasibilityStatus === 'pending_repeatability' ? 'Pending' : 'Limited', detail: report.repeatabilityGatePass ? 'Repeatability verified' : 'Needs two successful refreshes' },
  ]
  // Compact views keep only the three figures that explain where the money goes;
  // coverage percentages and the feasibility gate stay in Data quality.
  const compactLabels = ['Decomposed funds', 'Fund remainder', 'Intrinsically opaque']
  const cards = compact ? allCards.filter((card) => compactLabels.includes(card.label)) : allCards
  // Green = identified, amber = could be identified, red = cannot be identified.
  const tones: Record<string, { value: string; border: string; dot: string }> = {
    'Decomposed funds': { value: SEMANTIC_TEXT_CLASSES.coverage, ...SEMANTIC_ACCENT_CLASSES.coverage },
    'Fund remainder': { value: SEMANTIC_TEXT_CLASSES.warning, ...SEMANTIC_ACCENT_CLASSES.warning },
    'Intrinsically opaque': { value: SEMANTIC_TEXT_CLASSES.error, ...SEMANTIC_ACCENT_CLASSES.error },
  }
  return (
    <div className={`grid grid-cols-1 gap-3 ${compact ? 'md:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
      {cards.map((card) => {
        const tone = tones[card.label]
        return (
        <div key={card.label} className={`rounded-xl border border-gray-800 bg-gray-900 p-4 ${tone ? `border-l-4 ${tone.border}` : ''}`}>
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            {tone && <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />}{card.label}
          </div>
          <div className={`mt-1.5 text-xl font-semibold tabular-nums ${tone?.value ?? 'text-white'}`}>{card.value}</div>
          <div className="mt-1 text-xs text-gray-500">{card.detail}</div>
        </div>
        )
      })}
    </div>
  )
}
