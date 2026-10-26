import { useState } from 'react'

import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { formatExactPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/formatExactPerformanceDateRange'
import { formatPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceDateRange'
import { formatPerformanceIrrLabel } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceIrrLabel'
import {
  buildAssetIrrRankings,
  resolveContributionHorizon,
} from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel'
import type {
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AssetIrrSummary } from '@/domains/portfolio/shared/types/assetIrr.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Group, ToggleButton } from '@/shared/ui/Controls.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import {
  ContributionListItem,
  IrrList,
} from './PerformanceRankingLists/PerformanceRankingLists.view'

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

function MetricLabel({
  label,
  tooltip,
  scope,
}: {
  label: string
  tooltip: string
  scope: FilterScopeSpec
}) {
  return (
    <Text
      as="div"
      variant="microOverline"
      tone="subtle"
      className="flex items-center"
    >
      <span>{label}</span>
      <ScopedInfoTooltip text={tooltip} scope={scope} />
    </Text>
  )
}

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
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <Text
          as="h3"
          variant="overline"
          tone="subtle"
          className="flex items-center"
        >
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
        </Text>
        <Text variant="micro" tone="subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.shareOfGains')
            : i18n.t('ui.performancecontributioncard.shareOfLosses')}
        </Text>
      </div>
      {items.length === 0 ? (
        <Surface
          variant="emptyCaption"
          as="p"
          tone="subtle"
          align="center"
          className="px-3 py-6"
        >
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveContribution')
            : i18n.t('ui.performancecontributioncard.noNegativeContribution')}
        </Surface>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <ContributionListItem
              key={item.key}
              item={item}
              positive={positive}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

export function AssetIrrView({
  summary,
  status,
}: {
  summary: AssetIrrSummary
  status: IrrStatus
}) {
  const formatDate = useFormatDate()
  if (status === 'loading') {
    return (
      <Surface
        variant="empty"
        tone="subtle"
        align="center"
        className="mt-5 py-10"
      >
        {i18n.t('ui.performancecontributioncard.calculatingAssetIrr')}
      </Surface>
    )
  }
  if (status === 'error' || !summary.available) {
    return (
      <Surface
        variant="empty"
        tone="subtle"
        align="center"
        className="mt-5 py-10"
      >
        {i18n.t(
          'ui.performancecontributioncard.assetIrrIsNotAvailableForThisSelection',
        )}
      </Surface>
    )
  }

  const { measuredCount, topReturns, underperformers } =
    buildAssetIrrRankings(summary)

  return (
    <>
      <Surface
        variant="inset"
        className="mt-4 grid grid-cols-1 gap-3 p-3 sm:grid-cols-2"
      >
        <div>
          <MetricLabel
            label={i18n.t('ui.performancecontributioncard.assetsMeasured')}
            tooltip={i18n.t(
              'ui.performancecontributioncard.numberOfAssetsWithEnoughPositiveAndNegativeCash',
            )}
            // eslint-disable-next-line local/no-prop-drilling -- The asset-IRR feature owns its effective reporting scope.
            scope={{
              account: 'filterable',
              period: 'range',
              effectiveDate: summary.end_date,
            }}
          />
          <Text
            as="div"
            variant="statistic"
            tone="secondary"
            numeric
            className="mt-1"
          >
            {measuredCount}
          </Text>
        </div>
        <div>
          <Text as="div" variant="microOverline" tone="subtle">
            {i18n.t('ui.performancecontributioncard.period')}
          </Text>
          <Text as="div" variant="label" tone="muted" className="mt-1">
            {formatExactPerformanceDateRange(
              { startDate: summary.start_date, endDate: summary.end_date },
              formatDate,
            )}
          </Text>
        </div>
      </Surface>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IrrList
          title={i18n.t('ui.performancecontributioncard.topIrrs')}
          items={topReturns}
          positive
        />

        <IrrList
          title={i18n.t('ui.performancecontributioncard.lowestIrrs')}
          items={underperformers}
          positive={false}
        />
      </div>
    </>
  )
}

export function PerformanceContributionCard({
  assetIrr,
  assetIrrStatus,
  sinceTracking,
  trailingThreeYears,
  sinceTrackingIrr,
  trailingThreeYearIrr,
  irrStatus,
}: Props) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
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
  const netTone = summary.netContribution >= 0 ? 'positive' : 'negative'

  const description =
    view === 'contribution'
      ? i18n.t(
          'ui.performancecontributioncard.mainAssetsCreatingOrReducingPortfolioValue',
        )
      : i18n.t(
          'ui.performancecontributioncard.annualizedMoneyWeightedReturnByAssetOverTheSelected',
        )
  let scopePeriod: PeriodScopeMode = activeHorizon
  if (view === 'irr') scopePeriod = 'range'
  const showUnavailableContribution =
    view === 'contribution' && !summary.available
  const showContributionDetails = view === 'contribution' && summary.available

  return (
    <Surface as="section" variant="card" className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Text as="h2" variant="label" tone="muted">
            {i18n.t('ui.performancecontributioncard.performanceByAsset')}
          </Text>
          <Text as="p" variant="caption" tone="subtle" className="mt-1">
            {description}
          </Text>
        </div>
        <Group
          variant="canvasOutline"
          className="inline-flex self-start p-0.5"
          label={i18n.t('ui.performancecontributioncard.performanceMetric')}
        >
          <ToggleButton
            type="button"
            onClick={() => setView('contribution')}
            active={view === 'contribution'}
            variant="metricChoice"
            className="px-2.5 py-1"
          >
            {i18n.t('ui.performancecontributioncard.contribution.7ffdcf')}
          </ToggleButton>
          <ToggleButton
            type="button"
            onClick={() => setView('irr')}
            active={view === 'irr'}
            variant="metricChoice"
            className="px-2.5 py-1"
          >
            {i18n.t('ui.performancecontributioncard.irr.a0fb95')}
          </ToggleButton>
        </Group>
      </div>

      {view === 'irr' && (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      )}
      {showUnavailableContribution && (
        <Surface
          variant="empty"
          tone="subtle"
          align="center"
          className="mt-5 py-10"
        >
          {i18n.t(
            'ui.performancecontributioncard.contributionHistoryIsNotAvailableForThisSelection',
          )}
        </Surface>
      )}
      {showContributionDetails && (
        <>
          <Surface
            variant="inset"
            className="mt-4 grid grid-cols-1 gap-3 p-3 sm:grid-cols-3"
          >
            <div>
              <MetricLabel
                label={i18n.t('ui.performancecontributioncard.irrContext')}
                tooltip={i18n.t(
                  'ui.performancecontributioncard.annualizedMoneyWeightedReturnOverThisHorizonItAccounts',
                )}
                // eslint-disable-next-line local/no-prop-drilling -- This card owns the selected reporting horizon.
                scope={{
                  account: 'filterable',
                  period: scopePeriod,
                  effectiveDate: summary.endDate,
                }}
              />
              <Text
                as="div"
                variant="statistic"
                tone="return"
                numeric
                className="mt-1"
              >
                {formatPerformanceIrrLabel(irr, irrStatus, formatPercentage)}
              </Text>
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
                  period: scopePeriod,
                  effectiveDate: summary.endDate,
                }}
              />
              <Text
                as="div"
                variant="statistic"
                tone={netTone}
                numeric
                className="mt-1"
              >
                {formatMoney(summary.netContribution, { style: 'full' })}
              </Text>
            </div>
            <div>
              <Text as="div" variant="microOverline" tone="subtle">
                {i18n.t('ui.performancecontributioncard.period')}
              </Text>
              <div className="mt-2 flex items-center justify-between gap-3">
                <Text
                  as="div"
                  variant="label"
                  tone="muted"
                  wrap="nowrap"
                  className="min-w-0"
                >
                  {formatPerformanceDateRange(summary, formatDate)}
                </Text>
                <Group
                  variant="inset"
                  className="inline-flex shrink-0 p-0.5"
                  label={i18n.t(
                    'ui.performancecontributioncard.contributionHorizon',
                  )}
                >
                  <ToggleButton
                    type="button"
                    onClick={() => setHorizon('since-tracking')}
                    active={activeHorizon === 'since-tracking'}
                    variant="horizonChoice"
                    className="px-2.5 py-1"
                  >
                    {i18n.t('ui.performancecontributioncard.sinceTracking')}
                  </ToggleButton>
                  <ToggleButton
                    type="button"
                    onClick={() => setHorizon('trailing-3y')}
                    disabled={threeYearUnavailable}
                    active={activeHorizon === 'trailing-3y'}
                    title={
                      threeYearUnavailable
                        ? i18n.t(
                            'ui.performancecontributioncard.threeYearsOfHistoryAreNotYetAvailable',
                          )
                        : undefined
                    }
                    variant="optionalHorizonChoice"
                    className="px-2.5 py-1"
                  >
                    {i18n.t('ui.performancecontributioncard.trailing3Years')}
                  </ToggleButton>
                </Group>
              </div>
            </div>
          </Surface>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContributionList
              title={i18n.t('ui.performancecontributioncard.topContributors')}
              // eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature.
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
              // eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature.
              items={summary.detractors}
              positive={false}
              // eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature.
              scope={{
                account: 'filterable',
                period: scopePeriod,
                effectiveDate: summary.endDate,
              }}
            />
          </div>
        </>
      )}
    </Surface>
  )
}
