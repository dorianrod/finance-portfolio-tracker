import { useId, useState } from 'react'
import { fmtFull } from '@/shared/format/money'
import { formatPercentage, partitionPercentages } from '@/shared/format/percentage'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { accountLabel } from '@/features/filters/filterBar.logic'
import { QualityIndicatorCard } from '@/shared/ui/QualityIndicatorCard'
import { hasMaterialQualityGap } from '@/shared/quality/qualityThresholds'
import { AllocationDimensionQuality } from './AllocationDimensionQuality'
import type { AccountCoverage, DimensionCoverage } from './allocationCoverage.logic'

interface AllocationCoverageCardProps {
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
  accountLabels: Record<string, string>
  onOpenAffectedAssets?: (dimension?: DimensionCoverage['dimension']) => void
}

export function AllocationCoverageCard({ coverage, dimensionCoverage, accountLabels, onOpenAffectedAssets }: AllocationCoverageCardProps) {
  const [expandedDetail, setExpandedDetail] = useState<'accounts' | 'dimensions' | null>(null)
  const accountDetailsId = useId()
  const dimensionDetailsId = useId()
  const totalAllocated = coverage.reduce((s, c) => s + c.allocated, 0)
  const totalUnallocated = coverage.reduce((s, c) => s + c.unallocated, 0)
  const totalNotApplicable = coverage.reduce((s, c) => s + c.notApplicable, 0)
  const total = totalAllocated + totalUnallocated + totalNotApplicable
  if (total <= 0) return null

  const [mappedPct, unmappedPct, notApplicablePct] = partitionPercentages([
    totalAllocated,
    totalUnallocated,
    totalNotApplicable,
  ])

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <QualityIndicatorCard
          label="Portfolio scope"
          tooltip="Total value of the current active positions included in this allocation-quality check."
          amount={total}
          percentage={100}
          detail="Current active portfolio"
        />
      </div>

      <div className="relative mx-auto hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-700" />
        <div className="absolute left-[16.667%] right-[16.667%] top-5 h-px bg-gray-700" />
        <div className="absolute bottom-0 left-[16.667%] top-5 w-px bg-gradient-to-b from-gray-700 to-emerald-500/40" />
        <div className={`absolute bottom-0 left-1/2 top-5 w-px bg-gradient-to-b from-gray-700 ${hasMaterialQualityGap(unmappedPct) ? 'to-amber-500/40' : 'to-emerald-500/40'}`} />
        <div className="absolute bottom-0 left-[83.333%] top-5 w-px bg-gradient-to-b from-gray-700 to-gray-500/40" />
      </div>
      <div className="mx-auto h-6 w-px bg-gray-700 sm:hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        <QualityIndicatorCard
          label="Mapped positions"
          tooltip="Current position value found in at least one allocation row, using its ISIN or its synthetic name key when no ISIN exists. A match does not guarantee that every dimension is complete."
          amount={totalAllocated}
          percentage={mappedPct}
          detail="Share of selected portfolio"
          tone="coverage"
        >
          <DetailToggle
            label="Details by account"
            expanded={expandedDetail === 'accounts'}
            controls={accountDetailsId}
            onClick={() => setExpandedDetail((current) => current === 'accounts' ? null : 'accounts')}
          />
          {expandedDetail === 'accounts' && (
            <div id={accountDetailsId} className="mt-3 space-y-4 border-t border-gray-800 pt-3">
              {coverage.map((c) => {
                const rowTotal = c.allocated + c.unallocated + c.notApplicable
                if (rowTotal <= 0) return null
                const [allocatedPct, unallocatedPct, notApplicablePct] = partitionPercentages([
                  c.allocated,
                  c.unallocated,
                  c.notApplicable,
                ])
                const label = accountLabel(c.account, accountLabels)
                return (
                  <div key={c.account}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-xs text-gray-400" title={label}>{label}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-gray-600">
                        {c.allocated + c.unallocated > 0 ? `${fmtFull(c.allocated)} · ${formatPercentage(allocatedPct)}%` : `${fmtFull(c.notApplicable)} · N/A`}
                      </span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-800" title={`${fmtFull(c.allocated)} mapped / ${fmtFull(c.unallocated)} unmapped / ${fmtFull(c.notApplicable)} not applicable`}>
                      {c.allocated > 0 && <div style={{ width: `${allocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />}
                      {c.unallocated > 0 && <div style={{ width: `${unallocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }} />}
                      {c.notApplicable > 0 && <div className="bg-gray-500" style={{ width: `${notApplicablePct}%` }} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard
          label="Unmapped positions"
          tooltip="Position value with no allocation row found. Together with mapped positions and not applicable balances, this accounts for the full selected portfolio."
          amount={totalUnallocated}
          percentage={unmappedPct}
          detail={totalUnallocated > 0 ? 'No allocation row found' : 'All applicable positions mapped'}
          tone={hasMaterialQualityGap(unmappedPct) ? 'warning' : 'coverage'}
        >
          <DetailToggle
            label="Details by dimension"
            expanded={expandedDetail === 'dimensions'}
            controls={dimensionDetailsId}
            onClick={() => setExpandedDetail((current) => current === 'dimensions' ? null : 'dimensions')}
          />
          {expandedDetail === 'dimensions' && (
            <div id={dimensionDetailsId} className="mt-3 border-t border-gray-800 pt-3">
              <p className="mb-3 text-[11px] leading-4 text-gray-600">
                Unmapped positions are NC in every dimension; mapped rows can also contain dimension-specific NC.
              </p>
              <AllocationDimensionQuality coverage={dimensionCoverage} onOpenIssues={onOpenAffectedAssets} />
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard
          label="Not applicable"
          tooltip="Savings, checking and brokerage-cash balances are intentionally excluded because allocation classification does not apply to cash accounts."
          amount={totalNotApplicable}
          percentage={notApplicablePct}
          detail="Savings, checking and brokerage cash"
          tone="muted"
        />
      </div>
    </div>
  )
}

function DetailToggle({
  label, expanded, controls, onClick,
}: {
  label: string
  expanded: boolean
  controls: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="mt-3 flex w-full items-center justify-between gap-3 border-t border-gray-800 pt-3 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
    >
      <span>{expanded ? `Hide ${label.toLowerCase()}` : label}</span>
      <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </button>
  )
}
