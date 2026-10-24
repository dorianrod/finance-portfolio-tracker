import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { accountLabel } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'
import { QualityIndicatorCard } from '@/domains/portfolio/shared/components/quality/QualityIndicatorCard.view'
import type {
  AccountCoverage,
  DimensionCoverage,
} from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'
import { useAccountFilterLabels } from '@/domains/portfolio/shared/services/useAccountFilterLabels'
import i18n from '@/i18n/i18n'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { useId, useState } from 'react'
import { AllocationDimensionQuality } from './AllocationDimensionQuality.feature'
import { DetailToggle } from './DetailToggle.view'

function LatestQualityScope() {
  return <FilterScopeBadges account="filterable" period="latest" />
}

type AllocationCoverageCardProps = {
  coverage: AccountCoverage[]
  dimensionCoverage: DimensionCoverage[]
}

function AccountCoverageRow({
  accountLabels,
  coverage,
}: {
  accountLabels: Record<string, string>
  coverage: AccountCoverage
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const rowTotal = coverage.allocated + coverage.unallocated + coverage.notApplicable
  if (rowTotal <= 0) return null
  const [allocatedPct, unallocatedPct, notApplicablePct] = partitionPercentages([
    coverage.allocated,
    coverage.unallocated,
    coverage.notApplicable,
  ])
  const label = accountLabel(coverage.account, accountLabels)
  const summary =
    coverage.allocated + coverage.unallocated > 0
      ? i18n.t('ui.allocationcoveragecard.allocatedSummary', {
          amount: formatMoney(coverage.allocated, { style: 'full' }),
          percentage: formatPercentage(allocatedPct),
        })
      : i18n.t('ui.allocationcoveragecard.notApplicableSummary', {
          amount: formatMoney(coverage.notApplicable, { style: 'full' }),
        })
  const detail = i18n.t('ui.allocationcoveragecard.accountCoverageDetail', {
    allocated: formatMoney(coverage.allocated, { style: 'full' }),
    unallocated: formatMoney(coverage.unallocated, { style: 'full' }),
    notApplicable: formatMoney(coverage.notApplicable, { style: 'full' }),
  })
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-xs text-content-muted" title={label}>
          {label}
        </span>
        <span className="shrink-0 text-[11px] tabular-nums text-content-subtle">{summary}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-raised" title={detail}>
        {coverage.allocated > 0 && (
          <div style={{ width: `${allocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />
        )}
        {coverage.unallocated > 0 && (
          <div
            style={{ width: `${unallocatedPct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }}
          />
        )}
        {coverage.notApplicable > 0 && (
          <div className="bg-content-subtle" style={{ width: `${notApplicablePct}%` }} />
        )}
      </div>
    </div>
  )
}

export function AllocationCoverageCard({
  coverage,
  dimensionCoverage,
}: AllocationCoverageCardProps) {
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
        <QualityIndicatorCard
          tooltipFooter={<LatestQualityScope />}
          label={i18n.t('ui.allocationcoveragecard.portfolioScope')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.totalValueOfTheCurrentActivePositionsIncludedIn',
          )}
          amount={total}
          percentage={100}
          detail={i18n.t('ui.allocationcoveragecard.currentActivePortfolio')}
        />
      </div>

      <div className="relative mx-auto hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-surface-hover" />
        <div className="absolute left-[16.667%] right-[16.667%] top-5 h-px bg-surface-hover" />
        <div className="absolute bottom-0 left-[16.667%] top-5 w-px bg-gradient-to-b from-border-strong to-positive/40" />
        <div
          className={`absolute bottom-0 left-1/2 top-5 w-px bg-gradient-to-b from-border-strong ${hasMaterialQualityGap(unmappedPct) ? 'to-warning/40' : 'to-positive/40'}`}
        />
        <div className="absolute bottom-0 left-[83.333%] top-5 w-px bg-gradient-to-b from-border-strong to-border-strong/40" />
      </div>
      <div className="mx-auto h-6 w-px bg-surface-hover sm:hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        <QualityIndicatorCard
          tooltipFooter={<LatestQualityScope />}
          label={i18n.t('ui.allocationcoveragecard.mappedPositions')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.currentPositionValueFoundInAtLeastOneAllocation',
          )}
          amount={totalAllocated}
          percentage={mappedPct}
          detail={i18n.t('ui.allocationcoveragecard.shareOfSelectedPortfolio')}
          tone="coverage"
        >
          <DetailToggle
            label={i18n.t('ui.allocationcoveragecard.detailsByAccount')}
            expanded={expandedDetail === 'accounts'}
            controls={accountDetailsId}
            onClick={() =>
              setExpandedDetail((current) => (current === 'accounts' ? null : 'accounts'))
            }
          />
          {expandedDetail === 'accounts' && (
            <div id={accountDetailsId} className="mt-3 space-y-4 border-t border-border pt-3">
              {coverage.map((item) => (
                <AccountCoverageRow
                  key={item.account}
                  accountLabels={accountLabels}
                  coverage={item}
                />
              ))}
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard
          tooltipFooter={<LatestQualityScope />}
          label={i18n.t('ui.allocationcoveragecard.unmappedPositions')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.positionValueWithNoAllocationRowFoundTogetherWith',
          )}
          amount={totalUnallocated}
          percentage={unmappedPct}
          detail={
            totalUnallocated > 0
              ? i18n.t('ui.allocationcoveragecard.noAllocationRowFound')
              : i18n.t('ui.allocationcoveragecard.allApplicablePositionsMapped')
          }
          tone={hasMaterialQualityGap(unmappedPct) ? 'warning' : 'coverage'}
        >
          <DetailToggle
            label={i18n.t('ui.allocationcoveragecard.detailsByDimension')}
            expanded={expandedDetail === 'dimensions'}
            controls={dimensionDetailsId}
            onClick={() =>
              setExpandedDetail((current) => (current === 'dimensions' ? null : 'dimensions'))
            }
          />
          {expandedDetail === 'dimensions' && (
            <div id={dimensionDetailsId} className="mt-3 border-t border-border pt-3">
              <p className="mb-3 text-[11px] leading-4 text-content-subtle">
                {i18n.t(
                  'ui.allocationcoveragecard.unmappedPositionsAreNcInEveryDimensionMappedRows',
                )}
              </p>
              <AllocationDimensionQuality coverage={dimensionCoverage} />
            </div>
          )}
        </QualityIndicatorCard>
        <QualityIndicatorCard
          tooltipFooter={<LatestQualityScope />}
          label={i18n.t('ui.allocationcoveragecard.notApplicable')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.savingsCheckingAndBrokerageCashBalancesAreIntentionallyExcluded',
          )}
          amount={totalNotApplicable}
          percentage={notApplicablePct}
          detail={i18n.t('ui.allocationcoveragecard.savingsCheckingAndBrokerageCash')}
          tone="muted"
        />
      </div>
    </div>
  )
}
