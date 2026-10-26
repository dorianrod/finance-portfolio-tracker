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
import { MetricDelta } from '@/shared/ui/Badge.view'
import { MetricCard, type MetricCardAccent } from '@/shared/ui/MetricCard.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

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
  accent: MetricCardAccent
  children: ReactNode
}) {
  const { navigateTo } = useDashboardNavigation()

  return (
    <MetricCard
      accent={accent}
      onOpen={() => navigateTo(destination)}
      label={i18n.t('ui.overviewsummarycards.openValue0Details', {
        value0: title,
      })}
    >
      <MetricCard.Header>
        <Text variant="prominentEyebrow" tone="subtle" className="block">
          {eyebrow}
        </Text>
        <Text
          variant="bodyStrong"
          tone="secondary"
          className="mt-1 flex items-center"
        >
          {title}
          <MetricCard.Action>
            <ScopedInfoTooltip text={description} scope={scope} />
          </MetricCard.Action>
        </Text>
      </MetricCard.Header>
      <MetricCard.Body>{children}</MetricCard.Body>
    </MetricCard>
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
        accent="value"
      >
        <Text variant="metric" tone="default" numeric className="block">
          {formatMoney(comparison.value.current)}
        </Text>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.value} />
          <PreviousValue value={comparison.value.previous} />
        </span>
        <Text variant="micro" tone="subtle" className="mt-3 block">
          {i18n.t('ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax')}
        </Text>
      </CardShell>

      <CardShell
        title={i18n.t('ui.overviewsummarycards.netContributions')}
        description={i18n.t(
          'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriodComparedWithThe',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
        eyebrow={i18n.t('ui.overviewsummarycards.cashFlow')}
        destination="wealth"
        accent="accent"
      >
        <Text variant="metric" tone="accent" numeric className="block">
          {formatMoney(comparison.contributions.current)}
        </Text>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.contributions} tone="contributions" />
          <PreviousValue value={comparison.contributions.previous} />
        </span>
        <Text variant="micro" tone="subtle" className="mt-3 block">
          {i18n.t(
            'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod',
          )}
        </Text>
      </CardShell>

      <CardShell
        title={i18n.t('ui.overviewsummarycards.performanceIncome')}
        description={i18n.t(
          'ui.overviewsummarycards.marketPerformanceAndPassiveIncomeGeneratedDuringThePeriod',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
        eyebrow={i18n.t('ui.overviewsummarycards.periodResult')}
        destination="performance"
        accent="positive"
      >
        <span className="flex items-baseline justify-between gap-2">
          <Text
            variant="metric"
            numeric
            tone={getOverviewPerformanceTone(
              comparison.marketPerformance.current,
            )}
          >
            {formatMoney(comparison.marketPerformance.current)}
          </Text>
          <DeltaBadge metric={comparison.marketPerformance} />
        </span>
        <Text
          variant="caption"
          className="mt-3 flex items-center justify-between gap-3"
        >
          <Text tone="subtle">
            {i18n.t('ui.overviewsummarycards.passiveIncome')}
          </Text>
          <Text variant="strong" tone="income" numeric>
            {formatMoney(comparison.passiveIncome.current)}
            {comparison.passiveIncome.delta != null && (
              <Text variant="tiny" tone="subtle" className="ml-1.5">
                ({signedMoney(comparison.passiveIncome.delta)})
              </Text>
            )}
          </Text>
        </Text>
        <Surface
          as="span"
          variant="microFooter"
          tone="subtle"
          className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 pt-2"
        >
          <span className="inline-flex items-center">
            {i18n.t('ui.overviewsummarycards.irrTrailing3y')}
            <Surface variant="interactiveOverlay" as="span">
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
            </Surface>
          </span>
          <Text
            variant="strong"
            numeric
            tone={getOverviewPerformanceTone(rollingThreeYearTri.current)}
          >
            {formatOverviewIrrValue(
              irrStatus,
              rollingThreeYearTri.current,
              formatPercentage,
            )}
          </Text>
          {rollingThreeYearDelta != null && (
            <MetricDelta
              variant="inline"
              tone={getOverviewPerformanceTone(rollingThreeYearDelta)}
            >
              {formatPercentage(rollingThreeYearDelta, {
                signed: true,
                unit: ' pp',
              })}
            </MetricDelta>
          )}
          <Text tone="subtle">
            {i18n.t('ui.overviewsummarycards.previous')}{' '}
            <Text variant="medium" tone="muted" numeric>
              {irrStatus === 'ready' && rollingThreeYearTri.previous != null
                ? formatPercentage(rollingThreeYearTri.previous, {
                    decimals: 2,
                    signed: true,
                  })
                : '—'}
            </Text>
          </Text>
        </Surface>
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
        accent="risk"
      >
        <span className="grid grid-cols-2 gap-4">
          <span>
            <Text variant="micro" tone="subtle" className="block">
              {i18n.t('ui.overviewsummarycards.largestAsset')}
            </Text>
            <Text
              variant="metricSecondary"
              tone="risk"
              numeric
              className="mt-1 block"
            >
              {primaryConcentration.current
                ? formatPercentage(primaryConcentration.current.topHoldingPct)
                : '—'}
            </Text>
            <Text
              variant="tinyLabel"
              numeric
              tone={getConcentrationTone(primaryConcentration.topHolding.delta)}
              className="mt-1 block"
            >
              {formatPercentage(primaryConcentration.topHolding.delta, {
                signed: true,
                unit: ' pp',
              })}
            </Text>
          </span>
          <span>
            <Text variant="micro" tone="subtle" className="block">
              {i18n.t('ui.overviewsummarycards.topFive')}
            </Text>
            <Text
              variant="metricSecondary"
              tone="risk"
              numeric
              className="mt-1 block"
            >
              {primaryConcentration.current
                ? formatPercentage(primaryConcentration.current.topFivePct)
                : '—'}
            </Text>
            <Text
              variant="tinyLabel"
              numeric
              tone={getConcentrationTone(primaryConcentration.topFive.delta)}
              className="mt-1 block"
            >
              {formatPercentage(primaryConcentration.topFive.delta, {
                signed: true,
                unit: ' pp',
              })}
            </Text>
          </span>
        </span>
        <Surface
          as="span"
          variant="microFooter"
          tone="subtle"
          className="mt-3 block space-y-1 pt-2"
        >
          {underlyingAvailable ? (
            <Text tone="subtle" className="block">
              {i18n.t('ui.overviewsummarycards.heldPositionsSummary', {
                largest: heldConcentration.current
                  ? formatPercentage(heldConcentration.current.topHoldingPct)
                  : '—',
                topFive: heldConcentration.current
                  ? formatPercentage(heldConcentration.current.topFivePct)
                  : '—',
              })}
            </Text>
          ) : (
            <span className="block">
              {i18n.t(
                'ui.overviewsummarycards.underlyingDetailUnavailableShowingHeldPositions',
              )}
            </span>
          )}
        </Surface>
      </CardShell>
    </div>
  )
}
