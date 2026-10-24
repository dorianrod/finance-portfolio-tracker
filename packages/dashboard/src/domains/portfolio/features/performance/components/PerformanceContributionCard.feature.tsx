import i18n from '@/i18n/i18n'
import { useState } from 'react'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import type { AssetIrrItem, AssetIrrSummary } from '@/domains/portfolio/shared/types/assetIrr.type'
import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import type { FilterScopeSpec, PeriodScopeMode } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import {
  buildAssetIrrRankings,
  resolveContributionHorizon,
} from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel'
import { formatPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceDateRange'
import { formatExactPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/formatExactPerformanceDateRange'
import { formatPerformanceIrrLabel } from '@/domains/portfolio/features/performance/helpers/formatters/formatPerformanceIrrLabel'

interface Props {
  assetIrr: AssetIrrSummary
  assetIrrStatus: IrrStatus
  sinceTracking: PerformanceContributionSummary
  trailingThreeYears: PerformanceContributionSummary
  sinceTrackingIrr: number | null
  trailingThreeYearIrr: number | null
  irrStatus: IrrStatus
}

type PerformanceView = 'contribution' | 'irr'

function MetricLabel({ label, tooltip, scope }: { label: string; tooltip: string; scope: FilterScopeSpec }) {
  return (
    <div className="flex items-center text-[11px] uppercase tracking-wider text-gray-600">
      <span>{label}</span>
      <ScopedInfoTooltip text={tooltip} scope={scope} />
    </div>
  )
}

function ContributionListItem({ item, positive }: { item: PerformanceContribution; positive: boolean }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const tone = positive ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
  return <li><div className="flex items-start justify-between gap-4 text-sm"><div className="min-w-0"><div className="truncate font-medium text-gray-300" title={item.name}>{item.label}</div><div className="truncate text-[11px] text-gray-600" title={item.accounts.join(', ')}>{item.accounts.join(', ')}</div></div><div className="shrink-0 text-right tabular-nums"><div className={`font-semibold ${tone}`}>{formatMoney(item.amount, { style: 'full' })}</div><div className="text-[11px] text-gray-500">{formatPercentage(item.share)}</div></div></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-800"><div className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.share, 100)}%` }} /></div></li>
}

function IrrListItem({ item, positive, strongestIrr }: { item: AssetIrrItem; positive: boolean; strongestIrr: number }) {
  const formatAssetLabel = useFormatAssetLabel()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const tone = positive ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
  return <li><div className="flex items-start justify-between gap-4 text-sm"><div className="min-w-0"><div className="truncate font-medium text-gray-300" title={item.name}>{formatAssetLabel(item, item.label)}</div><div className="truncate text-[11px] text-gray-600" title={item.accounts.join(', ')}>{item.account_types.join(', ') || item.accounts.join(', ')}</div></div><div className="shrink-0 text-right tabular-nums"><div className={`font-semibold ${tone}`}>{formatPercentage(item.irr, { decimals: 2, signed: true })}</div><div className="text-[11px] text-gray-500">{i18n.t('ui.performancecontributioncard.value')} {formatMoney(item.value, { style: 'full' })}</div></div></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-800"><div className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${strongestIrr > 0 ? Math.abs(item.irr) / strongestIrr * 100 : 0}%` }} /></div></li>
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
        <h3 className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
          <ScopedInfoTooltip
            // eslint-disable-next-line local/no-prop-drilling -- Copy selection is presentation logic owned by this contribution section.
            text={positive
              ? i18n.t('ui.performancecontributioncard.assetsThatCreatedTheMostPortfolioValueOverThe')
              : i18n.t('ui.performancecontributioncard.assetsThatReducedPortfolioValueTheMostOverThe')}
            scope={scope}
          />
        </h3>
        <span className="text-[11px] text-gray-600">{i18n.t('ui.performancecontributioncard.shareOf')} {positive ? i18n.t('ui.performancecontributioncard.gains') : i18n.t('ui.performancecontributioncard.losses')}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-800 px-3 py-6 text-center text-xs text-gray-600">

          {i18n.t('ui.performancecontributioncard.no')} {positive ? i18n.t('ui.performancecontributioncard.positive') : i18n.t('ui.performancecontributioncard.negative')}  {i18n.t('ui.performancecontributioncard.contribution')}
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => <ContributionListItem key={item.key} item={item} positive={positive} />)}
        </ol>
      )}
    </section>
  )
}

function IrrList({
  title,
  items,
  positive,
}: {
  title: string
  items: AssetIrrItem[]
  positive: boolean
}) {
  const strongestIrr = Math.max(0, ...items.map((item) => Math.abs(item.irr)))

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        <span className="text-[11px] text-gray-600">{i18n.t('ui.performancecontributioncard.annualizedIrr')}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-800 px-3 py-6 text-center text-xs text-gray-600">

          {i18n.t('ui.performancecontributioncard.no')} {positive ? i18n.t('ui.performancecontributioncard.positive') : i18n.t('ui.performancecontributioncard.negative')}  {i18n.t('ui.performancecontributioncard.irr')}
        </p>
      ) : (
        <ol className="space-y-3">
          {/* eslint-disable-next-line local/no-prop-drilling -- List items receive the list-wide visual scale from their direct parent. */}
          {items.map((item) => <IrrListItem key={item.key} item={item} positive={positive} strongestIrr={strongestIrr} />)}
        </ol>
      )}
    </section>
  )
}

export function AssetIrrView({ summary, status }: { summary: AssetIrrSummary; status: IrrStatus }) {
  const formatDate = useFormatDate()
  if (status === 'loading') {
    return <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">{i18n.t('ui.performancecontributioncard.calculatingAssetIrr')}</div>
  }
  if (status === 'error' || !summary.available) {
    return <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">{i18n.t('ui.performancecontributioncard.assetIrrIsNotAvailableForThisSelection')}</div>
  }

  const { measuredCount, topReturns, underperformers } = buildAssetIrrRankings(summary)

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-gray-950/40 p-3 sm:grid-cols-2">
        <div>
          <MetricLabel
            label={i18n.t('ui.performancecontributioncard.assetsMeasured')}
            tooltip={i18n.t('ui.performancecontributioncard.numberOfAssetsWithEnoughPositiveAndNegativeCash')}
            // eslint-disable-next-line local/no-prop-drilling -- The asset-IRR feature owns its effective reporting scope.
            scope={{ account: 'filterable', period: 'range', effectiveDate: summary.end_date }}
          />
          <div className="mt-1 text-lg font-semibold tabular-nums text-gray-300">{measuredCount}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gray-600">{i18n.t('ui.performancecontributioncard.period')}</div>
          <div className="mt-1 text-sm font-medium text-gray-400">{formatExactPerformanceDateRange({ startDate: summary.start_date, endDate: summary.end_date }, formatDate)}</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* eslint-disable-next-line local/no-prop-drilling -- Ranking partitioning is owned by the asset-IRR feature. */}
        <IrrList title={i18n.t('ui.performancecontributioncard.topIrrs')} items={topReturns} positive />
        {/* eslint-disable-next-line local/no-prop-drilling -- Ranking partitioning is owned by the asset-IRR feature. */}
        <IrrList title={i18n.t('ui.performancecontributioncard.lowestIrrs')} items={underperformers} positive={false} />
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
  const { activeHorizon, irr, summary, threeYearUnavailable } = resolveContributionHorizon({
    horizon,
    sinceTracking,
    sinceTrackingIrr,
    trailingThreeYears,
    trailingThreeYearIrr,
  })
  const netTone = summary.netContribution >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative

  const description = view === 'contribution'
    ? i18n.t('ui.performancecontributioncard.mainAssetsCreatingOrReducingPortfolioValue')
    : i18n.t('ui.performancecontributioncard.annualizedMoneyWeightedReturnByAssetOverTheSelected')
  let scopePeriod: PeriodScopeMode = activeHorizon
  if (view === 'irr') scopePeriod = 'range'
  const showUnavailableContribution = view === 'contribution' && !summary.available
  const showContributionDetails = view === 'contribution' && summary.available

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-400">{i18n.t('ui.performancecontributioncard.performanceByAsset')}</h2>
          <p className="mt-1 text-xs text-gray-600">{description}</p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-gray-700 bg-gray-950 p-0.5" aria-label={i18n.t('ui.performancecontributioncard.performanceMetric')}>
          <button
            type="button"
            onClick={() => setView('contribution')}
            aria-pressed={view === 'contribution'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'contribution' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >

            {i18n.t('ui.performancecontributioncard.contribution.7ffdcf')}
          </button>
          <button
            type="button"
            onClick={() => setView('irr')}
            aria-pressed={view === 'irr'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'irr' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >

            {i18n.t('ui.performancecontributioncard.irr.a0fb95')}
          </button>
        </div>
      </div>

      {view === 'irr' && (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      )}
      {showUnavailableContribution && (
        <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">

          {i18n.t('ui.performancecontributioncard.contributionHistoryIsNotAvailableForThisSelection')}
        </div>
      )}
      {showContributionDetails && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-gray-950/40 p-3 sm:grid-cols-3">
            <div>
              <MetricLabel
                label={i18n.t('ui.performancecontributioncard.irrContext')}
                tooltip={i18n.t('ui.performancecontributioncard.annualizedMoneyWeightedReturnOverThisHorizonItAccounts')}
                // eslint-disable-next-line local/no-prop-drilling -- This card owns the selected reporting horizon.
                scope={{ account: 'filterable', period: scopePeriod, effectiveDate: summary.endDate }}
              />
              <div className="mt-1 text-lg font-semibold tabular-nums text-teal-400">{formatPerformanceIrrLabel(irr, irrStatus, formatPercentage)}</div>
            </div>
            <div>
              <MetricLabel
                label={i18n.t('ui.performancecontributioncard.attributedNetPerformance')}
                tooltip={i18n.t('ui.performancecontributioncard.sumOfTheAttributedEuroContributionsAcrossTheSelected')}
                // eslint-disable-next-line local/no-prop-drilling -- This card owns the selected reporting horizon.
                scope={{ account: 'filterable', period: scopePeriod, effectiveDate: summary.endDate }}
              />
              <div className={`mt-1 text-lg font-semibold tabular-nums ${netTone}`}>{formatMoney(summary.netContribution, { style: 'full' })}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-600">{i18n.t('ui.performancecontributioncard.period')}</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0 whitespace-nowrap text-sm font-medium text-gray-400">{formatPerformanceDateRange(summary, formatDate)}</div>
                <div className="inline-flex shrink-0 rounded-lg border border-gray-800 bg-gray-950/40 p-0.5" aria-label={i18n.t('ui.performancecontributioncard.contributionHorizon')}>
                  <button
                    type="button"
                    onClick={() => setHorizon('since-tracking')}
                    aria-pressed={activeHorizon === 'since-tracking'}
                    className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'since-tracking' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >

                    {i18n.t('ui.performancecontributioncard.sinceTracking')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHorizon('trailing-3y')}
                    disabled={threeYearUnavailable}
                    aria-pressed={activeHorizon === 'trailing-3y'}
                    title={threeYearUnavailable ? i18n.t('ui.performancecontributioncard.threeYearsOfHistoryAreNotYetAvailable') : undefined}
                    className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'trailing-3y' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'} disabled:cursor-not-allowed disabled:text-gray-700`}
                  >

                    {i18n.t('ui.performancecontributioncard.trailing3Years')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature. */}
            <ContributionList title={i18n.t('ui.performancecontributioncard.topContributors')} items={summary.contributors} positive scope={{ account: 'filterable', period: scopePeriod, effectiveDate: summary.endDate }} />
            {/* eslint-disable-next-line local/no-prop-drilling -- Contribution ranking and scope are computed by the owning card feature. */}
            <ContributionList title={i18n.t('ui.performancecontributioncard.mainDetractors')} items={summary.detractors} positive={false} scope={{ account: 'filterable', period: scopePeriod, effectiveDate: summary.endDate }} />
          </div>
        </>
      )}
    </section>
  )
}
