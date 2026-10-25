import type { ReactNode } from 'react'

import { formatOverviewIrrValue } from '@/domains/portfolio/features/overview/helpers/formatters/formatOverviewIrrValue'
import { getConcentrationTone } from '@/domains/portfolio/features/overview/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/helpers/presenters/getOverviewPerformanceTone'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type {
  ComparedMetric,
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { Button, Decorative, DecorativeSvg } from '@/shared/ui/Controls.view'

import { DeltaBadge, PreviousValue } from './OverviewMetrics.view'

export type OverviewDestination = 'wealth' | 'performance' | 'allocation'

type SummaryCardsProps = {
  comparison: OverviewComparison
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
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
    <article className="group relative min-w-0 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface/80">
      <Button
        type="button"
        onClick={() => navigateTo(destination)}
        label={i18n.t('ui.overviewsummarycards.openValue0Details', {
          value0: title,
        })}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      <Decorative
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${accent}`}
      />
      <span className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-content-subtle">
            {eyebrow}
          </span>
          <span className="mt-1 flex items-center text-sm font-semibold text-content-secondary">
            {title}
            <span className="pointer-events-auto">
              <ScopedInfoTooltip text={description} scope={scope} />
            </span>
          </span>
        </span>
        <DecorativeSvg
          viewBox="0 0 20 20"
          fill="none"
          className="mt-0.5 h-4 w-4 shrink-0 text-content-subtle transition-all group-hover:translate-x-0.5 group-hover:text-content-muted"
        >
          <path
            d="M4 10h11m-4-4 4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </DecorativeSvg>
      </span>
      <span className="pointer-events-none relative z-10 mt-4 block">
        {children}
      </span>
    </article>
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
  const signedMoney = (value: number | null) =>
    value == null ? '—' : `${value > 0 ? '+' : ''}${formatMoney(value)}`
  const underlyingAvailable = underlyingConcentration.current != null
  const primaryConcentration = underlyingAvailable
    ? underlyingConcentration
    : heldConcentration
  const primaryLabel = underlyingAvailable
    ? i18n.t('ui.overviewsummarycards.underlyingAssets')
    : i18n.t('ui.overviewsummarycards.heldPositionsLimitedView')
  const rollingThreeYearDelta =
    irrStatus === 'ready' && rollingThreeYearTri.delta != null
      ? rollingThreeYearTri.delta
      : null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CardShell
        title={i18n.t('ui.overviewsummarycards.portfolioValue')}
        description={i18n.t(
          'ui.overviewsummarycards.grossMarketValueBeforeEstimatedTaxMeasuredAtThe',
        )}
        // eslint-disable-next-line local/no-prop-drilling -- The overview feature owns its period-end summary scope.
        scope={{
          account: 'filterable',
          period: 'as-of',
          effectiveDate: comparison.windows.current.end,
        }}
        eyebrow={i18n.t('ui.overviewsummarycards.atPeriodEnd')}
        destination="wealth"
        accent="bg-value"
      >
        <span className="block text-2xl font-semibold tracking-tight tabular-nums text-content">
          {formatMoney(comparison.value.current)}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.value} />
          <PreviousValue value={comparison.value.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-content-subtle">
          {i18n.t('ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax')}
        </span>
      </CardShell>

      <CardShell
        title={i18n.t('ui.overviewsummarycards.netContributions')}
        description={i18n.t(
          'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriodComparedWithThe',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
        eyebrow={i18n.t('ui.overviewsummarycards.cashFlow')}
        destination="wealth"
        accent="bg-accent"
      >
        <span
          className={`block text-2xl font-semibold tracking-tight tabular-nums ${SEMANTIC_TEXT_CLASSES.netContributions}`}
        >
          {formatMoney(comparison.contributions.current)}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.contributions} tone="contributions" />
          <PreviousValue value={comparison.contributions.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-content-subtle">
          {i18n.t(
            'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod',
          )}
        </span>
      </CardShell>

      <CardShell
        title={i18n.t('ui.overviewsummarycards.performanceIncome')}
        description={i18n.t(
          'ui.overviewsummarycards.marketPerformanceAndPassiveIncomeGeneratedDuringThePeriod',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
        eyebrow={i18n.t('ui.overviewsummarycards.periodResult')}
        destination="performance"
        accent="bg-positive"
      >
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={`text-2xl font-semibold tracking-tight tabular-nums ${getOverviewPerformanceTone(comparison.marketPerformance.current)}`}
          >
            {formatMoney(comparison.marketPerformance.current)}
          </span>
          <DeltaBadge metric={comparison.marketPerformance} />
        </span>
        <span className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-content-subtle">
            {i18n.t('ui.overviewsummarycards.passiveIncome')}
          </span>
          <span
            className={`font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.passiveIncome}`}
          >
            {formatMoney(comparison.passiveIncome.current)}
            {comparison.passiveIncome.delta != null && (
              <span className="ml-1.5 text-[10px] text-content-subtle">
                ({signedMoney(comparison.passiveIncome.delta)})
              </span>
            )}
          </span>
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-2 text-[11px] text-content-subtle">
          <span className="inline-flex items-center">
            {i18n.t('ui.overviewsummarycards.irrTrailing3y')}
            <span className="pointer-events-auto">
              <ScopedInfoTooltip
                text={i18n.t(
                  'ui.overviewsummarycards.annualizedMoneyWeightedReturnOverTheThreeYearsEnding',
                )}
                // eslint-disable-next-line local/no-prop-drilling -- The overview feature owns its trailing-period tooltip scope.
                scope={{
                  account: 'filterable',
                  period: 'trailing-3y',
                  effectiveDate: comparison.windows.current.end,
                }}
              />
            </span>
          </span>
          <span
            className={`font-semibold tabular-nums ${getOverviewPerformanceTone(rollingThreeYearTri.current)}`}
          >
            {formatOverviewIrrValue(
              irrStatus,
              rollingThreeYearTri.current,
              formatPercentage,
            )}
          </span>
          {rollingThreeYearDelta != null && (
            <span
              className={`inline-flex rounded-full bg-canvas/55 px-1.5 py-0.5 font-semibold tabular-nums ${getOverviewPerformanceTone(rollingThreeYearDelta)}`}
            >
              {formatPercentage(rollingThreeYearDelta, {
                signed: true,
                unit: ' pp',
              })}
            </span>
          )}
          <span className="text-content-subtle">
            {i18n.t('ui.overviewsummarycards.previous')}{' '}
            <span className="font-medium tabular-nums text-content-muted">
              {irrStatus === 'ready' && rollingThreeYearTri.previous != null
                ? formatPercentage(rollingThreeYearTri.previous, {
                    decimals: 2,
                    signed: true,
                  })
                : '—'}
            </span>
          </span>
        </span>
      </CardShell>

      <CardShell
        title={i18n.t('ui.overviewsummarycards.concentration')}
        description={i18n.t(
          'ui.overviewsummarycards.shareOfThePortfolioRepresentedByTheLargestAsset',
        )}
        // eslint-disable-next-line local/no-prop-drilling -- The overview feature owns concentration scope and fallback labeling.
        scope={{
          account: 'filterable',
          period: 'as-of',
          effectiveDate: comparison.windows.current.end,
        }}
        // eslint-disable-next-line local/no-prop-drilling -- The overview feature owns concentration scope and fallback labeling.
        eyebrow={primaryLabel}
        destination="allocation"
        accent="bg-risk"
      >
        <span className="grid grid-cols-2 gap-4">
          <span>
            <span className="block text-[11px] text-content-subtle">
              {i18n.t('ui.overviewsummarycards.largestAsset')}
            </span>
            <span
              className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.risk}`}
            >
              {primaryConcentration.current
                ? formatPercentage(primaryConcentration.current.topHoldingPct)
                : '—'}
            </span>
            <span
              className={`mt-1 block text-[10px] font-medium tabular-nums ${getConcentrationTone(primaryConcentration.topHolding.delta)}`}
            >
              {formatPercentage(primaryConcentration.topHolding.delta, {
                signed: true,
                unit: ' pp',
              })}
            </span>
          </span>
          <span>
            <span className="block text-[11px] text-content-subtle">
              {i18n.t('ui.overviewsummarycards.topFive')}
            </span>
            <span
              className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.riskSecondary}`}
            >
              {primaryConcentration.current
                ? formatPercentage(primaryConcentration.current.topFivePct)
                : '—'}
            </span>
            <span
              className={`mt-1 block text-[10px] font-medium tabular-nums ${getConcentrationTone(primaryConcentration.topFive.delta)}`}
            >
              {formatPercentage(primaryConcentration.topFive.delta, {
                signed: true,
                unit: ' pp',
              })}
            </span>
          </span>
        </span>
        <span className="mt-3 block space-y-1 border-t border-border pt-2 text-[11px] text-content-subtle">
          {underlyingAvailable ? (
            <span className="block text-content-subtle">
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
            <span className="block">
              {i18n.t(
                'ui.overviewsummarycards.underlyingDetailUnavailableShowingHeldPositions',
              )}
            </span>
          )}
        </span>
      </CardShell>
    </div>
  )
}
