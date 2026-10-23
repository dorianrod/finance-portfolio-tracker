import { useId, useState } from 'react'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { accountLabel } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'
import { QualityIndicatorCard } from '@/domains/portfolio/components/quality/QualityIndicatorCard.view'
import { hasMaterialQualityGap } from '@/domains/portfolio/helpers/quality/qualityThresholds'
import { useAccountFilterLabels } from '@/domains/portfolio/services/useAccountFilterLabels'
import { AllocationDimensionQuality } from './AllocationDimensionQuality.feature'
import type { AccountCoverage, DimensionCoverage } from './helpers/quality/computeAllocationCoverage'
import { FilterScopeBadges } from '@/domains/portfolio/components/filters/FilterScopeBadges.feature'

function LatestQualityScope() {
  return <FilterScopeBadges account="filterable" period="latest" />
}

interface AllocationCoverageCardProps {
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
}

function AccountCoverageRow({ accountLabels, coverage }: { accountLabels: Record<string, string>; coverage: AccountCoverage }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const rowTotal = coverage.allocated + coverage.unallocated + coverage.notApplicable
  if (rowTotal <= 0) return null
  const [allocatedPct, unallocatedPct, notApplicablePct] = partitionPercentages([coverage.allocated, coverage.unallocated, coverage.notApplicable])
  const label = accountLabel(coverage.account, accountLabels)
  return <div><div className="mb-1.5 flex items-baseline justify-between gap-3"><span className="truncate text-xs text-gray-400" title={label}>{label}</span><span className="shrink-0 text-[11px] tabular-nums text-gray-600">{coverage.allocated + coverage.unallocated > 0 ? `${formatMoney(coverage.allocated, { style: 'full' })} · ${formatPercentage(allocatedPct)}` : `${formatMoney(coverage.notApplicable, { style: 'full' })} · N/A`}</span></div><div className="flex h-1.5 overflow-hidden rounded-full bg-gray-800" title={`${formatMoney(coverage.allocated, { style: 'full' })} mapped / ${formatMoney(coverage.unallocated, { style: 'full' })} unmapped / ${formatMoney(coverage.notApplicable, { style: 'full' })} not applicable`}>{coverage.allocated > 0 && <div style={{ width: `${allocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />}{coverage.unallocated > 0 && <div style={{ width: `${unallocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }} />}{coverage.notApplicable > 0 && <div className="bg-gray-500" style={{ width: `${notApplicablePct}%` }} />}</div></div>
}

export function AllocationCoverageCard({ coverage, dimensionCoverage }: AllocationCoverageCardProps) {
  const accountLabels = useAccountFilterLabels()
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
        <QualityIndicatorCard tooltipFooter={<LatestQualityScope />}
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
        <QualityIndicatorCard tooltipFooter={<LatestQualityScope />}
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
              {coverage.map((item) => <AccountCoverageRow key={item.account} accountLabels={accountLabels} coverage={item} />)}
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard tooltipFooter={<LatestQualityScope />}
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
              <AllocationDimensionQuality coverage={dimensionCoverage} />
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard tooltipFooter={<LatestQualityScope />}
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
