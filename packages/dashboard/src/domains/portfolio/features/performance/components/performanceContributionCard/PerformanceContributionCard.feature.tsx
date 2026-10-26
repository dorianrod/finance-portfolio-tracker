import { useState } from 'react'

import { ContributionListItem } from '@/domains/portfolio/features/performance/components/PerformanceRankingLists/performanceRankingLists/ContributionListItem.view'
import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { formatPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceDateRange'
import { formatPerformanceIrrLabel } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceIrrLabel'
import { resolveContributionHorizon } from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel/resolveContributionHorizon'
import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import type {
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Group } from '@/shared/ui/controls/Group.view'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AssetIrrView } from './AssetIrrView.feature'
import { MetricLabel } from './MetricLabel.feature'

export function PerformanceContributionCard({
  assetIrr,
  assetIrrStatus,
  sinceTracking,
  trailingThreeYears,
  sinceTrackingIrr,
  trailingThreeYearIrr,
  irrStatus,
}: Props) {
  const [view, setView] = useState<PerformanceView>('contribution')
  const [horizon, setHorizon] = useState<ContributionHorizon>('since-tracking')
  const { activeHorizon, irr, summary, threeYearUnavailable } =
    resolveContributionHorizon({
      horizon,
      sinceTracking,
      sinceTrackingIrr,
      trailingThreeYears,
      trailingThreeYearIrr,
    })

  const description =
    view === 'contribution'
      ? i18n.t(
          'ui.performancecontributioncard.mainAssetsCreatingOrReducingPortfolioValue',
        )
      : i18n.t(
          'ui.performancecontributioncard.annualizedMoneyWeightedReturnByAssetOverTheSelected',
        )
  const showUnavailableContribution =
    view === 'contribution' && !summary.available
  const showContributionDetails = view === 'contribution' && summary.available

  return (
    <Surface as="section" variant="card">
      <Stack gap="default" align="start" justify="between">
        <div>
          <Text as="h2" variant="label" tone="muted">
            {i18n.t('ui.performancecontributioncard.performanceByAsset')}
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {description}
            </Text>
          </Layout>
        </div>
        <Layout>
          <Group
            variant="canvasOutline"
            label={i18n.t('ui.performancecontributioncard.performanceMetric')}
          >
            <Inline as="div" inset="compact">
              <ToggleButton
                type="button"
                onClick={() => setView('contribution')}
                active={view === 'contribution'}
                variant="metricChoice"
              >
                {i18n.t('ui.performancecontributioncard.contribution.7ffdcf')}
              </ToggleButton>
              <ToggleButton
                type="button"
                onClick={() => setView('irr')}
                active={view === 'irr'}
                variant="metricChoice"
              >
                {i18n.t('ui.performancecontributioncard.irr.a0fb95')}
              </ToggleButton>
            </Inline>
          </Group>
        </Layout>
      </Stack>

      {view === 'irr' && (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      )}
      {showUnavailableContribution && (
        <Layout spaceBefore="spacious">
          <Surface variant="empty" tone="subtle" align="center">
            {i18n.t(
              'ui.performancecontributioncard.contributionHistoryIsNotAvailableForThisSelection',
            )}
          </Surface>
        </Layout>
      )}
      {showContributionDetails && (
        <>
          <ContributionSummaryMetrics
            summary={summary}
            irr={irr}
            irrStatus={irrStatus}
            activeHorizon={activeHorizon}
            threeYearUnavailable={threeYearUnavailable}
            onHorizonChange={setHorizon}
          />
          <ContributionRankings summary={summary} scopePeriod={activeHorizon} />
        </>
      )}
    </Surface>
  )
}

type Props = {
  assetIrr: AssetIrrSummary
  assetIrrStatus: IrrStatus
  sinceTracking: PerformanceContributionSummary
  trailingThreeYears: PerformanceContributionSummary
  sinceTrackingIrr: number | null
  trailingThreeYearIrr: number | null
  irrStatus: IrrStatus
}

type PerformanceView = 'contribution' | 'irr'

function ContributionList({
  title,
  items,
  positive,
  scope,
}: {
  title: string
  items: PerformanceContribution[]
  positive: boolean
  scope: FilterScopeSpec
}) {
  return (
    <section>
      <Inline
        as="div"
        spaceAfter="default"
        align="baseline"
        justify="between"
        gap="default"
      >
        <Text as="h3" variant="overline" tone="subtle">
          <Inline as="span" align="center">
            {title}
            <ScopedInfoTooltip
              // eslint-disable-next-line local/no-prop-drilling -- Copy selection is presentation logic owned by this contribution section.
              text={
                positive
                  ? i18n.t(
                      'ui.performancecontributioncard.assetsThatCreatedTheMostPortfolioValueOverThe',
                    )
                  : i18n.t(
                      'ui.performancecontributioncard.assetsThatReducedPortfolioValueTheMostOverThe',
                    )
              }
              scope={scope}
            />
          </Inline>
        </Text>
        <Text variant="micro" tone="subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.shareOfGains')
            : i18n.t('ui.performancecontributioncard.shareOfLosses')}
        </Text>
      </Inline>
      {items.length === 0 ? (
        <Surface variant="emptyCaption" as="p" tone="subtle" align="center">
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveContribution')
            : i18n.t('ui.performancecontributioncard.noNegativeContribution')}
        </Surface>
      ) : (
        <Stack as="ol" gap="default">
          {items.map((item) => (
            <ContributionListItem
              key={item.key}
              item={item}
              positive={positive}
            />
          ))}
        </Stack>
      )}
    </section>
  )
}

function ContributionSummaryMetrics({
  summary,
  irr,
  irrStatus,
  activeHorizon,
  threeYearUnavailable,
  onHorizonChange,
}: {
  summary: PerformanceContributionSummary
  irr: number | null
  irrStatus: IrrStatus
  activeHorizon: ContributionHorizon
  threeYearUnavailable: boolean
  onHorizonChange: (horizon: ContributionHorizon) => void
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const netTone = summary.netContribution >= 0 ? 'positive' : 'negative'
  return (
    <Layout spaceBefore="spacious">
      <Surface variant="inset">
        <Grid columns={3} gap="default" inset="default">
          <div>
            <MetricLabel
              label={i18n.t('ui.performancecontributioncard.irrContext')}
              tooltip={i18n.t(
                'ui.performancecontributioncard.annualizedMoneyWeightedReturnOverThisHorizonItAccounts',
              )}
              // eslint-disable-next-line local/no-prop-drilling -- This card owns the selected reporting horizon.
              scope={{
                account: 'filterable',
                period: activeHorizon,
                effectiveDate: summary.endDate,
              }}
            />
            <Layout spaceBefore="compact">
              <Text as="div" variant="statistic" tone={'contrast'} numeric>
                {formatPerformanceIrrLabel(irr, irrStatus, formatPercentage)}
              </Text>
            </Layout>
          </div>
          <div>
            <MetricLabel
              label={i18n.t(
                'ui.performancecontributioncard.attributedNetPerformance',
              )}
              tooltip={i18n.t(
                'ui.performancecontributioncard.sumOfTheAttributedEuroContributionsAcrossTheSelected',
              )}
              // eslint-disable-next-line local/no-prop-drilling -- This card owns the selected reporting horizon.
              scope={{
                account: 'filterable',
                period: activeHorizon,
                effectiveDate: summary.endDate,
              }}
            />
            <Layout spaceBefore="compact">
              <Text as="div" variant="statistic" tone={netTone} numeric>
                {formatMoney(summary.netContribution, {
                  style: 'full',
                })}
              </Text>
            </Layout>
          </div>
          <div>
            <Text as="div" variant="microOverline" tone="subtle">
              {i18n.t('ui.performancecontributioncard.period')}
            </Text>
            <Inline
              as="div"
              spaceBefore="default"
              align="center"
              justify="between"
              gap="default"
            >
              <Layout>
                <Text as="div" variant="label" tone="muted" wrap="nowrap">
                  {formatPerformanceDateRange(summary, formatDate)}
                </Text>
              </Layout>
              <Layout sizing="fixed">
                <Group
                  variant="inset"
                  label={i18n.t(
                    'ui.performancecontributioncard.contributionHorizon',
                  )}
                >
                  <Inline as="div" inset="compact">
                    <ToggleButton
                      type="button"
                      onClick={() => onHorizonChange('since-tracking')}
                      active={activeHorizon === 'since-tracking'}
                      variant="compactChoice"
                    >
                      {i18n.t('ui.performancecontributioncard.sinceTracking')}
                    </ToggleButton>
                    <ToggleButton
                      type="button"
                      onClick={() => onHorizonChange('trailing-3y')}
                      disabled={threeYearUnavailable}
                      active={activeHorizon === 'trailing-3y'}
                      title={
                        threeYearUnavailable
                          ? i18n.t(
                              'ui.performancecontributioncard.threeYearsOfHistoryAreNotYetAvailable',
                            )
                          : undefined
                      }
                      variant="optionalCompactChoice"
                    >
                      {i18n.t('ui.performancecontributioncard.trailing3Years')}
                    </ToggleButton>
                  </Inline>
                </Group>
              </Layout>
            </Inline>
          </div>
        </Grid>
      </Surface>
    </Layout>
  )
}

function ContributionRankings({
  summary,
  scopePeriod,
}: {
  summary: PerformanceContributionSummary
  scopePeriod: PeriodScopeMode
}) {
  return (
    <Grid columns={2} spaceBefore="spacious" gap="spacious">
      <ContributionList
        title={i18n.t('ui.performancecontributioncard.topContributors')}

        items={summary.contributors}
        positive
        // eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature.
        scope={{
          account: 'filterable',
          period: scopePeriod,
          effectiveDate: summary.endDate,
        }}
      />
      <ContributionList
        title={i18n.t('ui.performancecontributioncard.mainDetractors')}

        items={summary.detractors}
        positive={false}
        // eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature.
        scope={{
          account: 'filterable',
          period: scopePeriod,
          effectiveDate: summary.endDate,
        }}
      />
    </Grid>
  )
}
