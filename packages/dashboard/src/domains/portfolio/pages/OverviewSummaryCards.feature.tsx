import i18n from '@/i18n/i18n'
import type { ReactNode } from 'react'
import type { IrrStatus } from '@/domains/portfolio/types/history'
import type {
  ComparedMetric,
  OverviewConcentrationComparison,
  OverviewComparison,
} from './helpers/calculators/buildOverviewComparison'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import type { FilterScopeSpec } from '@/domains/portfolio/components/filters/FilterScopeBadges.feature'
import { useDashboardNavigation } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardNavigation'
import { formatOverviewIrrValue } from './helpers/formatters/formatOverviewIrrValue'
import { getConcentrationTone } from './helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from './helpers/presenters/getOverviewPerformanceTone'

export type OverviewDestination = 'wealth' | 'performance' | 'allocation'

interface SummaryCardsProps {
  comparison: OverviewComparison
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
}

function DeltaBadge({ metric, tone = 'performance' }: {
  metric: ComparedMetric
  tone?: 'performance' | 'contributions' | 'concentration'
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  let color = getOverviewPerformanceTone(metric.delta)
  if (tone === 'contributions') color = SEMANTIC_TEXT_CLASSES.netContributions
  else if (tone === 'concentration') color = getConcentrationTone(metric.delta)
  let label = metric.delta == null ? '—' : `${metric.delta > 0 ? '+' : ''}${formatMoney(metric.delta)}`
  if (tone === 'concentration') {
    label = metric.delta == null ? '—' : formatPercentage(metric.delta, { signed: true, unit: ' pp' })
  }
  const deltaPercentage = tone !== 'concentration' && metric.deltaPct != null
    ? metric.deltaPct
    : null
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gray-950/55 px-2 py-1 text-[11px] font-semibold tabular-nums ${color}`}>
      {label}
      {deltaPercentage != null && (
        <span className="font-medium opacity-75">· {formatPercentage(deltaPercentage, { signed: true })}</span>
      )}
    </span>
  )
}

function CardShell({
  title,
  description,
  scope,
  eyebrow,
  destination,
  accent,
  children,
}: {
  title: string
  description: string
  scope: FilterScopeSpec
  eyebrow: string
  destination: OverviewDestination
  accent: string
  children: ReactNode
}) {
  const { navigateTo } = useDashboardNavigation()

  return (
    <article className="group relative min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gray-700 hover:bg-gray-900/80">
      <button type="button" onClick={() => navigateTo(destination)} aria-label={i18n.t('ui.overviewsummarycards.openValue0Details', { value0: title })} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${accent}`} aria-hidden="true" />
      <span className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">{eyebrow}</span>
          <span className="mt-1 flex items-center text-sm font-semibold text-gray-200">
            {title}
            <span className="pointer-events-auto"><ScopedInfoTooltip text={description} scope={scope} /></span>
          </span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-gray-700 transition-all group-hover:translate-x-0.5 group-hover:text-gray-400">
          <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="pointer-events-none relative z-10 mt-4 block">{children}</span>
    </article>
  )
}

function PreviousValue({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  const formatMoney = useFormatMoney()
  return (
    <span className="text-[11px] text-gray-600">

      {i18n.t('ui.overviewsummarycards.previous')} <span className="font-medium tabular-nums text-gray-400">{value == null ? i18n.t('ui.overviewsummarycards.unavailable') : `${formatMoney(value)}${suffix}`}</span>
    </span>
  )
}

export function OverviewSummaryCards({
  comparison,
  heldConcentration,
  underlyingConcentration,
  rollingThreeYearTri,
  irrStatus,
}: SummaryCardsProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const money = (value: number | null) => value == null ? '—' : formatMoney(value)
  const signedMoney = (value: number | null) => value == null ? '—' : `${value > 0 ? '+' : ''}${formatMoney(value)}`
  const points = (value: number | null) => value == null ? '—' : formatPercentage(value, { signed: true, unit: ' pp' })
  const underlyingAvailable = underlyingConcentration.current != null
  const primaryConcentration = underlyingAvailable ? underlyingConcentration : heldConcentration
  const primaryLabel = underlyingAvailable ? i18n.t('ui.overviewsummarycards.underlyingAssets') : i18n.t('ui.overviewsummarycards.heldPositionsLimitedView')
  const rollingThreeYearDelta = irrStatus === 'ready' && rollingThreeYearTri.delta != null
    ? rollingThreeYearTri.delta
    : null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* eslint-disable-next-line local/no-prop-drilling -- The overview feature owns its period-end summary scope. */}
      <CardShell title={i18n.t('ui.overviewsummarycards.portfolioValue')} description={i18n.t('ui.overviewsummarycards.grossMarketValueBeforeEstimatedTaxMeasuredAtThe')} scope={{ account: 'filterable', period: 'as-of', effectiveDate: comparison.windows.current.end }} eyebrow={i18n.t('ui.overviewsummarycards.atPeriodEnd')} destination="wealth" accent="bg-cyan-400">
        <span className="block text-2xl font-semibold tracking-tight tabular-nums text-white">{money(comparison.value.current)}</span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.value} />
          <PreviousValue value={comparison.value.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-gray-600">{i18n.t('ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax')}</span>
      </CardShell>

      <CardShell title={i18n.t('ui.overviewsummarycards.netContributions')} description={i18n.t('ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriodComparedWithThe')} scope={{ account: 'filterable', period: 'comparison-range' }} eyebrow={i18n.t('ui.overviewsummarycards.cashFlow')} destination="wealth" accent="bg-blue-400">
        <span className={`block text-2xl font-semibold tracking-tight tabular-nums ${SEMANTIC_TEXT_CLASSES.netContributions}`}>
          {money(comparison.contributions.current)}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.contributions} tone="contributions" />
          <PreviousValue value={comparison.contributions.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-gray-600">{i18n.t('ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod')}</span>
      </CardShell>

      <CardShell title={i18n.t('ui.overviewsummarycards.performanceIncome')} description={i18n.t('ui.overviewsummarycards.marketPerformanceAndPassiveIncomeGeneratedDuringThePeriod')} scope={{ account: 'filterable', period: 'comparison-range' }} eyebrow={i18n.t('ui.overviewsummarycards.periodResult')} destination="performance" accent="bg-emerald-400">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`text-2xl font-semibold tracking-tight tabular-nums ${getOverviewPerformanceTone(comparison.marketPerformance.current)}`}>
            {money(comparison.marketPerformance.current)}
          </span>
          <DeltaBadge metric={comparison.marketPerformance} />
        </span>
        <span className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-600">{i18n.t('ui.overviewsummarycards.passiveIncome')}</span>
          <span className={`font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.passiveIncome}`}>
            {money(comparison.passiveIncome.current)}
            {comparison.passiveIncome.delta != null && <span className="ml-1.5 text-[10px] text-gray-500">({signedMoney(comparison.passiveIncome.delta)})</span>}
          </span>
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-800 pt-2 text-[11px] text-gray-600">
          <span className="inline-flex items-center">

            {i18n.t('ui.overviewsummarycards.irrTrailing3y')}
            {/* eslint-disable-next-line local/no-prop-drilling -- The overview feature owns its trailing-period tooltip scope. */}
            <span className="pointer-events-auto"><ScopedInfoTooltip text={i18n.t('ui.overviewsummarycards.annualizedMoneyWeightedReturnOverTheThreeYearsEnding')} scope={{ account: 'filterable', period: 'trailing-3y', effectiveDate: comparison.windows.current.end }} /></span>
          </span>
          <span className={`font-semibold tabular-nums ${getOverviewPerformanceTone(rollingThreeYearTri.current)}`}>
            {formatOverviewIrrValue(irrStatus, rollingThreeYearTri.current, formatPercentage)}
          </span>
          {rollingThreeYearDelta != null && (
            <span className={`inline-flex rounded-full bg-gray-950/55 px-1.5 py-0.5 font-semibold tabular-nums ${getOverviewPerformanceTone(rollingThreeYearDelta)}`}>
              {formatPercentage(rollingThreeYearDelta, { signed: true, unit: ' pp' })}
            </span>
          )}
          <span className="text-gray-600">

            {i18n.t('ui.overviewsummarycards.previous')} <span className="font-medium tabular-nums text-gray-400">{irrStatus === 'ready' && rollingThreeYearTri.previous != null ? formatPercentage(rollingThreeYearTri.previous, { decimals: 2, signed: true }) : '—'}</span>
          </span>
        </span>
      </CardShell>

      {/* eslint-disable-next-line local/no-prop-drilling -- The overview feature owns concentration scope and fallback labeling. */}
      <CardShell title={i18n.t('ui.overviewsummarycards.concentration')} description={i18n.t('ui.overviewsummarycards.shareOfThePortfolioRepresentedByTheLargestAsset')} scope={{ account: 'filterable', period: 'as-of', effectiveDate: comparison.windows.current.end }} eyebrow={primaryLabel} destination="allocation" accent="bg-orange-400">
        <span className="grid grid-cols-2 gap-4">
          <span>
            <span className="block text-[11px] text-gray-600">{i18n.t('ui.overviewsummarycards.largestAsset')}</span>
            <span className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.risk}`}>
              {primaryConcentration.current ? formatPercentage(primaryConcentration.current.topHoldingPct) : '—'}
            </span>
            <span className={`mt-1 block text-[10px] font-medium tabular-nums ${getConcentrationTone(primaryConcentration.topHolding.delta)}`}>
              {points(primaryConcentration.topHolding.delta)}
            </span>
          </span>
          <span>
            <span className="block text-[11px] text-gray-600">{i18n.t('ui.overviewsummarycards.topFive')}</span>
            <span className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.riskSecondary}`}>
              {primaryConcentration.current ? formatPercentage(primaryConcentration.current.topFivePct) : '—'}
            </span>
            <span className={`mt-1 block text-[10px] font-medium tabular-nums ${getConcentrationTone(primaryConcentration.topFive.delta)}`}>
              {points(primaryConcentration.topFive.delta)}
            </span>
          </span>
        </span>
        <span className="mt-3 block space-y-1 border-t border-gray-800 pt-2 text-[11px] text-gray-600">
          {underlyingAvailable ? (
            <span className="block text-gray-600">
              {i18n.t('ui.overviewsummarycards.heldPositionsSummary', {
                largest: heldConcentration.current
                  ? formatPercentage(heldConcentration.current.topHoldingPct)
                  : '—',
                topFive: heldConcentration.current
                  ? formatPercentage(heldConcentration.current.topFivePct)
                  : '—',
              })}
            </span>
          ) : (
            <span className="block">{i18n.t('ui.overviewsummarycards.underlyingDetailUnavailableShowingHeldPositions')}</span>
          )}
        </span>
      </CardShell>
    </div>
  )
}
