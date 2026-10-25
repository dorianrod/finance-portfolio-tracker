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
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

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
    <div className="flex items-center text-[11px] uppercase tracking-wider text-content-subtle">
      <span>{label}</span>
      <ScopedInfoTooltip text={tooltip} scope={scope} />
    </div>
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
        <h3 className="flex items-center text-xs font-semibold uppercase tracking-wider text-content-subtle">
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
        </h3>
        <span className="text-[11px] text-content-subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.shareOfGains')
            : i18n.t('ui.performancecontributioncard.shareOfLosses')}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-content-subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveContribution')
            : i18n.t('ui.performancecontributioncard.noNegativeContribution')}
        </p>
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
      <div className="mt-5 rounded-lg border border-dashed border-border py-10 text-center text-sm text-content-subtle">
        {i18n.t('ui.performancecontributioncard.calculatingAssetIrr')}
      </div>
    )
  }
  if (status === 'error' || !summary.available) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-border py-10 text-center text-sm text-content-subtle">
        {i18n.t(
          'ui.performancecontributioncard.assetIrrIsNotAvailableForThisSelection',
        )}
      </div>
    )
  }

  const { measuredCount, topReturns, underperformers } =
    buildAssetIrrRankings(summary)

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-canvas/40 p-3 sm:grid-cols-2">
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
          <div className="mt-1 text-lg font-semibold tabular-nums text-content-secondary">
            {measuredCount}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-content-subtle">
            {i18n.t('ui.performancecontributioncard.period')}
          </div>
          <div className="mt-1 text-sm font-medium text-content-muted">
            {formatExactPerformanceDateRange(
              { startDate: summary.start_date, endDate: summary.end_date },
              formatDate,
            )}
          </div>
        </div>
      </div>
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
  const netTone =
    summary.netContribution >= 0
      ? SEMANTIC_TEXT_CLASSES.performancePositive
      : SEMANTIC_TEXT_CLASSES.performanceNegative

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
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-content-muted">
            {i18n.t('ui.performancecontributioncard.performanceByAsset')}
          </h2>
          <p className="mt-1 text-xs text-content-subtle">{description}</p>
        </div>
        <div
          className="inline-flex self-start rounded-lg border border-border-strong bg-canvas p-0.5"
          aria-label={i18n.t(
            'ui.performancecontributioncard.performanceMetric',
          )}
        >
          <button
            type="button"
            onClick={() => setView('contribution')}
            aria-pressed={view === 'contribution'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'contribution' ? 'bg-surface-hover text-content' : 'text-content-subtle hover:text-content-secondary'}`}
          >
            {i18n.t('ui.performancecontributioncard.contribution.7ffdcf')}
          </button>
          <button
            type="button"
            onClick={() => setView('irr')}
            aria-pressed={view === 'irr'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'irr' ? 'bg-surface-hover text-content' : 'text-content-subtle hover:text-content-secondary'}`}
          >
            {i18n.t('ui.performancecontributioncard.irr.a0fb95')}
          </button>
        </div>
      </div>

      {view === 'irr' && (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      )}
      {showUnavailableContribution && (
        <div className="mt-5 rounded-lg border border-dashed border-border py-10 text-center text-sm text-content-subtle">
          {i18n.t(
            'ui.performancecontributioncard.contributionHistoryIsNotAvailableForThisSelection',
          )}
        </div>
      )}
      {showContributionDetails && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-canvas/40 p-3 sm:grid-cols-3">
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
              <div className="mt-1 text-lg font-semibold tabular-nums text-return">
                {formatPerformanceIrrLabel(irr, irrStatus, formatPercentage)}
              </div>
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
              <div
                className={`mt-1 text-lg font-semibold tabular-nums ${netTone}`}
              >
                {formatMoney(summary.netContribution, { style: 'full' })}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-content-subtle">
                {i18n.t('ui.performancecontributioncard.period')}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0 whitespace-nowrap text-sm font-medium text-content-muted">
                  {formatPerformanceDateRange(summary, formatDate)}
                </div>
                <div
                  className="inline-flex shrink-0 rounded-lg border border-border bg-canvas/40 p-0.5"
                  aria-label={i18n.t(
                    'ui.performancecontributioncard.contributionHorizon',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setHorizon('since-tracking')}
                    aria-pressed={activeHorizon === 'since-tracking'}
                    className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'since-tracking' ? 'bg-surface-hover text-content' : 'text-content-subtle hover:text-content-secondary'}`}
                  >
                    {i18n.t('ui.performancecontributioncard.sinceTracking')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHorizon('trailing-3y')}
                    disabled={threeYearUnavailable}
                    aria-pressed={activeHorizon === 'trailing-3y'}
                    title={
                      threeYearUnavailable
                        ? i18n.t(
                            'ui.performancecontributioncard.threeYearsOfHistoryAreNotYetAvailable',
                          )
                        : undefined
                    }
                    className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'trailing-3y' ? 'bg-surface-hover text-content' : 'text-content-subtle hover:text-content-secondary'} disabled:cursor-not-allowed disabled:text-content-subtle`}
                  >
                    {i18n.t('ui.performancecontributioncard.trailing3Years')}
                  </button>
                </div>
              </div>
            </div>
          </div>

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
    </section>
  )
}
