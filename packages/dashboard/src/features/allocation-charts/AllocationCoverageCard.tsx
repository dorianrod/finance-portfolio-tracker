import { useId, useState, type ReactNode } from 'react'
import { fmtFull } from '@/shared/format/money'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { accountLabel } from '@/features/filters/filterBar.logic'
import { AllocationDimensionQuality } from './AllocationDimensionQuality'
import type { AccountCoverage, DimensionCoverage } from './allocationCoverage.logic'

interface AllocationCoverageCardProps {
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
  accountLabels: Record<string, string>
}

export function AllocationCoverageCard({ coverage, dimensionCoverage, accountLabels }: AllocationCoverageCardProps) {
  const [expandedDetail, setExpandedDetail] = useState<'accounts' | 'dimensions' | null>(null)
  const accountDetailsId = useId()
  const dimensionDetailsId = useId()
  const totalAllocated = coverage.reduce((s, c) => s + c.allocated, 0)
  const totalUnallocated = coverage.reduce((s, c) => s + c.unallocated, 0)
  const total = totalAllocated + totalUnallocated
  if (total <= 0) return null

  const overallPct = (totalAllocated / total) * 100

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <CoverageNodeCard
          label="Portfolio scope"
          tooltip="Total value of the current active positions included in this allocation-quality check."
          amount={total}
          percentage={100}
          detail="Current active portfolio"
        />
      </div>

      <div className="relative mx-auto hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-700" />
        <div className="absolute left-1/4 right-1/4 top-5 h-px bg-gray-700" />
        <div className="absolute bottom-0 left-1/4 top-5 w-px bg-gradient-to-b from-gray-700 to-emerald-500/40" />
        <div className="absolute bottom-0 left-3/4 top-5 w-px bg-gradient-to-b from-gray-700 to-amber-500/40" />
      </div>
      <div className="mx-auto h-6 w-px bg-gray-700 sm:hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        <CoverageNodeCard
          label="Mapped positions"
          tooltip="Current position value found in at least one allocation row, using its ISIN or its synthetic name key when no ISIN exists. A match does not guarantee that every dimension is complete."
          amount={totalAllocated}
          percentage={overallPct}
          detail="Matched to an allocation row"
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
                const rowTotal = c.allocated + c.unallocated
                if (rowTotal <= 0) return null
                const pct = (c.allocated / rowTotal) * 100
                const label = accountLabel(c.account, accountLabels)
                return (
                  <div key={c.account}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-xs text-gray-400" title={label}>{label}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-gray-600">{fmtFull(c.allocated)} · {Math.round(pct)}%</span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-800" title={`${fmtFull(c.allocated)} mapped / ${fmtFull(c.unallocated)} unmapped`}>
                      {c.allocated > 0 && <div style={{ width: `${pct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />}
                      {c.unallocated > 0 && <div style={{ width: `${100 - pct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }} />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CoverageNodeCard>
        <CoverageNodeCard
          label="Unmapped positions"
          tooltip="Current position value with no matching row in any allocation file. These positions cannot yet contribute to geography, sector, currency or asset-class breakdowns."
          amount={totalUnallocated}
          percentage={100 - overallPct}
          detail="No allocation row"
          tone="warning"
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
              <AllocationDimensionQuality coverage={dimensionCoverage} />
            </div>
          )}
        </CoverageNodeCard>
      </div>
    </div>
  )
}

function CoverageNodeCard({
  label, tooltip, amount, percentage, detail, tone = 'neutral', children,
}: {
  label: string
  tooltip: string
  amount: number
  percentage: number
  detail: string
  tone?: 'neutral' | 'coverage' | 'warning'
  children?: ReactNode
}) {
  const safePercentage = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0
  const percentageLabel = safePercentage > 0 && safePercentage < 0.1 ? safePercentage.toFixed(2) : safePercentage.toFixed(1)
  const textColor = tone === 'coverage'
    ? SEMANTIC_TEXT_CLASSES.coverage
    : tone === 'warning' ? SEMANTIC_TEXT_CLASSES.warning : 'text-blue-400'
  const barColor = tone === 'coverage'
    ? SEMANTIC_COLORS.coverage
    : tone === 'warning' ? SEMANTIC_COLORS.coverageGap : SEMANTIC_COLORS.netContributions

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm" title={tooltip}>
      <div className="text-xs font-medium text-gray-400">{label}</div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className={`text-xl font-semibold tabular-nums ${textColor}`}>{percentageLabel}%</span>
        <span className="text-xs tabular-nums text-gray-500">{fmtFull(amount)}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safePercentage}>
        <div className="h-full rounded-full" style={{ width: `${safePercentage}%`, backgroundColor: barColor }} />
      </div>
      <div className="mt-2 text-xs text-gray-600">{detail}</div>
      {children}
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
