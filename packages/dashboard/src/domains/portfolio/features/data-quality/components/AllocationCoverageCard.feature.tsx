import { useState } from 'react'

import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { QualityIndicatorCard } from '@/domains/portfolio/shared/components/quality/QualityIndicatorCard.view'
import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
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
import { DecorativeBlock } from '@/shared/ui/Controls.view'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch, ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

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
  const rowTotal =
    coverage.allocated + coverage.unallocated + coverage.notApplicable
  if (rowTotal <= 0) return null
  const [allocatedPct, unallocatedPct, notApplicablePct] = partitionPercentages(
    [coverage.allocated, coverage.unallocated, coverage.notApplicable],
  )
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
        <Text variant="caption" tone="muted" truncate title={label}>
          {label}
        </Text>
        <Text variant="micro" tone="subtle" numeric className="shrink-0">
          {summary}
        </Text>
      </div>
      <Surface
        variant="track"
        className="flex h-1.5 overflow-hidden"
        title={detail}
      >
        {coverage.allocated > 0 && (
          <SeriesSwatch
            as="div"
            tone="coverage"
            style={{ width: `${allocatedPct}%` }}
          />
        )}
        {coverage.unallocated > 0 && (
          <SeriesSwatch
            as="div"
            tone="coverageGap"
            style={{ width: `${unallocatedPct}%` }}
          />
        )}
        {coverage.notApplicable > 0 && (
          <ToneSwatch
            as="div"
            tone="subtle"
            style={{ width: `${notApplicablePct}%` }}
          />
        )}
      </Surface>
    </div>
  )
}

export function AllocationCoverageCard({
  coverage,
  dimensionCoverage,
}: AllocationCoverageCardProps) {
  const accountLabels = useAccountFilterLabels()
  const [expandedDetail, setExpandedDetail] = useState<
    'accounts' | 'dimensions' | null
  >(null)
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
          label={i18n.t('ui.allocationcoveragecard.portfolioScope')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.totalValueOfTheCurrentActivePositionsIncludedIn',
          )}
          amount={total}
          percentage={100}
          detail={i18n.t('ui.allocationcoveragecard.currentActivePortfolio')}
        >
          <QualityIndicatorCard.TooltipFooter>
            <LatestQualityScope />
          </QualityIndicatorCard.TooltipFooter>
        </QualityIndicatorCard>
      </div>

      <DecorativeBlock className="relative mx-auto hidden h-10 sm:block">
        <Surface
          variant="centeredConnector"
          className="absolute left-1/2 top-0 h-5 w-px"
        />
        <Surface
          variant="highlighted"
          className="absolute left-[16.667%] right-[16.667%] top-5 h-px"
        />
        <Surface
          variant="positiveConnector"
          className="absolute bottom-0 left-[16.667%] top-5 w-px"
        />
        <Surface
          variant={
            hasMaterialQualityGap(unmappedPct)
              ? 'warningConnector'
              : 'positiveConnector'
          }
          className="absolute bottom-0 left-1/2 top-5 w-px"
        />
        <Surface
          variant="neutralConnector"
          className="absolute bottom-0 left-[83.333%] top-5 w-px"
        />
      </DecorativeBlock>
      <DecorativeBlock
        variant="highlighted"
        className="mx-auto h-6 w-px sm:hidden"
      />

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.mappedPositions')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.currentPositionValueFoundInAtLeastOneAllocation',
          )}
          amount={totalAllocated}
          percentage={mappedPct}
          detail={i18n.t('ui.allocationcoveragecard.shareOfSelectedPortfolio')}
          tone="coverage"
        >
          <QualityIndicatorCard.TooltipFooter>
            <LatestQualityScope />
          </QualityIndicatorCard.TooltipFooter>
          <Disclosure expanded={expandedDetail === 'accounts'}>
            <DetailToggle
              label={i18n.t('ui.allocationcoveragecard.detailsByAccount')}
              expanded={expandedDetail === 'accounts'}
              onClick={() =>
                setExpandedDetail((current) =>
                  current === 'accounts' ? null : 'accounts',
                )
              }
            />
            <Disclosure.Content
              variant="sectionStart"
              className="mt-3 space-y-4 pt-3"
            >
              {coverage.map((item) => (
                <AccountCoverageRow
                  key={item.account}
                  accountLabels={accountLabels}
                  coverage={item}
                />
              ))}
            </Disclosure.Content>
          </Disclosure>
        </QualityIndicatorCard>
        <QualityIndicatorCard
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
          <QualityIndicatorCard.TooltipFooter>
            <LatestQualityScope />
          </QualityIndicatorCard.TooltipFooter>
          <Disclosure expanded={expandedDetail === 'dimensions'}>
            <DetailToggle
              label={i18n.t('ui.allocationcoveragecard.detailsByDimension')}
              expanded={expandedDetail === 'dimensions'}
              onClick={() =>
                setExpandedDetail((current) =>
                  current === 'dimensions' ? null : 'dimensions',
                )
              }
            />
            <Disclosure.Content variant="sectionStart" className="mt-3 pt-3">
              <Text as="p" variant="microHelper" tone="subtle" className="mb-3">
                {i18n.t(
                  'ui.allocationcoveragecard.unmappedPositionsAreNcInEveryDimensionMappedRows',
                )}
              </Text>
              <AllocationDimensionQuality coverage={dimensionCoverage} />
            </Disclosure.Content>
          </Disclosure>
        </QualityIndicatorCard>
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.notApplicable')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.savingsCheckingAndBrokerageCashBalancesAreIntentionallyExcluded',
          )}
          amount={totalNotApplicable}
          percentage={notApplicablePct}
          detail={i18n.t(
            'ui.allocationcoveragecard.savingsCheckingAndBrokerageCash',
          )}
          tone="muted"
        >
          <QualityIndicatorCard.TooltipFooter>
            <LatestQualityScope />
          </QualityIndicatorCard.TooltipFooter>
        </QualityIndicatorCard>
      </div>
    </div>
  )
}
