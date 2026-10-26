import { useState } from 'react'

import { QualityIndicatorCard } from '@/domains/portfolio/features/data-quality/features/assessment/components/QualityIndicatorCard.view'
import type {
  AccountCoverage,
  DimensionCoverage,
} from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverage.types'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/qualityThresholds/hasMaterialQualityGap'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
import { useAccountFilterLabels } from '@/domains/portfolio/shared/services/useAccountFilterLabels'
import i18n from '@/i18n/i18n'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { DecorativeBlock } from '@/shared/ui/controls/DecorativeBlock.view'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'
import { TreeConnector } from '@/shared/ui/TreeConnector.view'

import { AllocationDimensionQuality } from './AllocationDimensionQuality.feature'
import { DetailToggle } from './DetailToggle.view'

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
      <Layout>
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
      </Layout>

      <Layout placement="inset" height="connector">
        <DecorativeBlock>
          <Layout flow="block" hiddenUntil="small">
            <TreeConnector position="stem">
              <Surface variant="centeredConnector" />
            </TreeConnector>
            <TreeConnector position="bridge">
              <Surface variant="highlighted" />
            </TreeConnector>
            <TreeConnector position="left">
              <Surface variant="positiveConnector" />
            </TreeConnector>
            <TreeConnector position="center">
              <Surface
                variant={
                  hasMaterialQualityGap(unmappedPct)
                    ? 'warningConnector'
                    : 'positiveConnector'
                }
              />
            </TreeConnector>
            <TreeConnector position="right">
              <Surface variant="neutralConnector" />
            </TreeConnector>
          </Layout>
        </DecorativeBlock>
      </Layout>
      <Layout height="icon" width="divider" hideFrom="small">
        <DecorativeBlock variant="highlighted">
          <Layout></Layout>
        </DecorativeBlock>
      </Layout>

      <Grid columns={3} align="start" gap="default">
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
            <Layout spaceBefore="default">
              <Disclosure.Content variant="sectionStart">
                <Stack gap="relaxed" inset="default">
                  {coverage.map((item) => (
                    <AccountCoverageRow
                      key={item.account}
                      accountLabels={accountLabels}
                      coverage={item}
                    />
                  ))}
                </Stack>
              </Disclosure.Content>
            </Layout>
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
            <Layout spaceBefore="default">
              <Disclosure.Content variant="sectionStart">
                <Inset inset="default">
                  <Layout spaceAfter="default">
                    <Text as="p" variant="microHelper" tone="subtle">
                      {i18n.t(
                        'ui.allocationcoveragecard.unmappedPositionsAreNcInEveryDimensionMappedRows',
                      )}
                    </Text>
                  </Layout>
                  <AllocationDimensionQuality coverage={dimensionCoverage} />
                </Inset>
              </Disclosure.Content>
            </Layout>
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
      </Grid>
    </div>
  )
}

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
      <Inline
        as="div"
        spaceAfter="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text variant="caption" tone="muted" truncate title={label}>
          {label}
        </Text>
        <Layout as="span" flow="inline" sizing="fixed">
          <Text variant="micro" tone="subtle" numeric>
            {summary}
          </Text>
        </Layout>
      </Inline>
      <Layout height="track" overflow="clip">
        <Surface variant="track" title={detail}>
          <Inline as="div" height="full">
            {coverage.allocated > 0 && (
              <SeriesSwatch
                as="div"
                tone={PORTFOLIO_CHART_TONES.coverage}
                share={allocatedPct}
              />
            )}
            {coverage.unallocated > 0 && (
              <SeriesSwatch
                as="div"
                tone={PORTFOLIO_CHART_TONES.coverageGap}
                share={unallocatedPct}
              />
            )}
            {coverage.notApplicable > 0 && (
              <ToneSwatch as="div" tone="subtle" share={notApplicablePct} />
            )}
          </Inline>
        </Surface>
      </Layout>
    </div>
  )
}
