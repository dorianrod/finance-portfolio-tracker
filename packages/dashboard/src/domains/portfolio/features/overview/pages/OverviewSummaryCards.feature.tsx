import type { ReactNode } from 'react'

import type {
  ComparedMetric,
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { formatOverviewIrrValue } from '@/domains/portfolio/features/overview/helpers/formatters/formatOverviewIrrValue'
import { getConcentrationTone } from '@/domains/portfolio/features/overview/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/helpers/presenters/getOverviewPerformanceTone'
import { DeltaBadge } from '@/domains/portfolio/features/overview/pages/overviewMetrics/DeltaBadge.view'
import { PreviousValue } from '@/domains/portfolio/features/overview/pages/overviewMetrics/PreviousValue.view'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { MetricDelta } from '@/shared/ui/badge/MetricDelta.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { MetricCard, type MetricCardAccent } from '@/shared/ui/MetricCard.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function OverviewSummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewValueCard comparison={props.comparison} />
      <OverviewContributionsCard comparison={props.comparison} />
      <OverviewPerformanceCard
        comparison={props.comparison}
        rollingThreeYearTri={props.rollingThreeYearTri}
        irrStatus={props.irrStatus}
      />
      <OverviewConcentrationCard
        comparison={props.comparison}
        heldConcentration={props.heldConcentration}
        underlyingConcentration={props.underlyingConcentration}
      />
    </div>
  )
}

export type OverviewDestination = 'wealth' | 'performance' | 'diversification'

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
        <Text variant="prominentEyebrow" tone="subtle">
          <Layout as="span" flow="block">
            {eyebrow}
          </Layout>
        </Text>
        <Layout as="span" flow="block" spaceBefore="compact">
          <Text variant="bodyStrong" tone="secondary">
            <Inline as="span" align="center">
              {title}
              <MetricCard.Action>
                <ScopedInfoTooltip text={description} scope={scope} />
              </MetricCard.Action>
            </Inline>
          </Text>
        </Layout>
      </MetricCard.Header>
      <MetricCard.Body>{children}</MetricCard.Body>
    </MetricCard>
  )
}

function OverviewValueCard({
  comparison,
}: Pick<SummaryCardsProps, 'comparison'>) {
  const formatMoney = useFormatMoney()

  return (
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
      accent={'highlight'}
    >
      <Text variant="metric" tone="default" numeric>
        <Layout as="span" flow="block">
          {formatMoney(comparison.value.current)}
        </Layout>
      </Text>
      <span className="mt-3 flex flex-wrap items-center gap-2">
        <DeltaBadge metric={comparison.value} />
        <PreviousValue value={comparison.value.previous} />
      </span>
      <span className="block mt-3">
        <Text variant="micro" tone="subtle">
          <Layout as="span" flow="block">
            {i18n.t(
              'ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax',
            )}
          </Layout>
        </Text>
      </span>
    </CardShell>
  )
}

function OverviewContributionsCard({
  comparison,
}: Pick<SummaryCardsProps, 'comparison'>) {
  const formatMoney = useFormatMoney()

  return (
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
      <Text variant="metric" tone="accent" numeric>
        <Layout as="span" flow="block">
          {formatMoney(comparison.contributions.current)}
        </Layout>
      </Text>
      <span className="mt-3 flex flex-wrap items-center gap-2">
        <DeltaBadge metric={comparison.contributions} tone="contributions" />
        <PreviousValue value={comparison.contributions.previous} />
      </span>
      <span className="block mt-3">
        <Text variant="micro" tone="subtle">
          <Layout as="span" flow="block">
            {i18n.t(
              'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod',
            )}
          </Layout>
        </Text>
      </span>
    </CardShell>
  )
}

function OverviewPerformanceCard({
  comparison,
  rollingThreeYearTri,
  irrStatus,
}: Pick<
  SummaryCardsProps,
  'comparison' | 'rollingThreeYearTri' | 'irrStatus'
>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const signedMoney = (value: number | null) =>
    value == null ? '—' : `${value > 0 ? '+' : ''}${formatMoney(value)}`
  const rollingThreeYearDelta =
    irrStatus === 'ready' && rollingThreeYearTri.delta != null
      ? rollingThreeYearTri.delta
      : null

  return (
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
      <span className="block mt-3">
        <Text variant="caption">
          <Inline as="span" align="center" justify="between" gap="default">
            <Text tone="subtle">
              {i18n.t('ui.overviewsummarycards.passiveIncome')}
            </Text>
            <Text variant="strong" tone={'decorative'} numeric>
              {formatMoney(comparison.passiveIncome.current)}
              {comparison.passiveIncome.delta != null && (
                <Layout as="span" flow="inline">
                  <Text variant="tiny" tone="subtle">
                    ({signedMoney(comparison.passiveIncome.delta)})
                  </Text>
                </Layout>
              )}
            </Text>
          </Inline>
        </Text>
      </span>
      <span className="block mt-3">
        <Surface as="span" variant="microFooter" tone="subtle">
          <Inline
            as="span"
            flow="wrap"
            align="center"
            gap="compact"
            inset="compact"
          >
            <Inline as="span" align="center">
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
            </Inline>
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
          </Inline>
        </Surface>
      </span>
    </CardShell>
  )
}

function OverviewConcentrationCard({
  comparison,
  heldConcentration,
  underlyingConcentration,
}: Pick<
  SummaryCardsProps,
  'comparison' | 'heldConcentration' | 'underlyingConcentration'
>) {
  const formatPercentage = useFormatPercentage()
  const underlyingAvailable = underlyingConcentration.current != null
  const primaryConcentration = underlyingAvailable
    ? underlyingConcentration
    : heldConcentration
  const primaryLabel = underlyingAvailable
    ? i18n.t('ui.overviewsummarycards.underlyingAssets')
    : i18n.t('ui.overviewsummarycards.heldPositionsLimitedView')

  return (
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
      destination="diversification"
      accent={'attention'}
    >
      <span className="grid grid-cols-2 gap-4">
        <span>
          <Text variant="micro" tone="subtle">
            <Layout as="span" flow="block">
              {i18n.t('ui.overviewsummarycards.largestAsset')}
            </Layout>
          </Text>
          <span className="block mt-1">
            <Text variant="metricSecondary" tone={'attention'} numeric>
              <Layout as="span" flow="block">
                {primaryConcentration.current
                  ? formatPercentage(primaryConcentration.current.topHoldingPct)
                  : '—'}
              </Layout>
            </Text>
          </span>
          <span className="block mt-1">
            <Text
              variant="tinyLabel"
              numeric
              tone={getConcentrationTone(primaryConcentration.topHolding.delta)}
            >
              <Layout as="span" flow="block">
                {formatPercentage(primaryConcentration.topHolding.delta, {
                  signed: true,
                  unit: ' pp',
                })}
              </Layout>
            </Text>
          </span>
        </span>
        <span>
          <Text variant="micro" tone="subtle">
            <Layout as="span" flow="block">
              {i18n.t('ui.overviewsummarycards.topFive')}
            </Layout>
          </Text>
          <span className="block mt-1">
            <Text variant="metricSecondary" tone={'attention'} numeric>
              <Layout as="span" flow="block">
                {primaryConcentration.current
                  ? formatPercentage(primaryConcentration.current.topFivePct)
                  : '—'}
              </Layout>
            </Text>
          </span>
          <span className="block mt-1">
            <Text
              variant="tinyLabel"
              numeric
              tone={getConcentrationTone(primaryConcentration.topFive.delta)}
            >
              <Layout as="span" flow="block">
                {formatPercentage(primaryConcentration.topFive.delta, {
                  signed: true,
                  unit: ' pp',
                })}
              </Layout>
            </Text>
          </span>
        </span>
      </span>
      <span className="block mt-3">
        <Surface as="span" variant="microFooter" tone="subtle">
          <Stack as="span" gap="compact" inset="compact">
            {underlyingAvailable ? (
              <Text tone="subtle">
                <Layout as="span" flow="block">
                  {i18n.t('ui.overviewsummarycards.heldPositionsSummary', {
                    largest: heldConcentration.current
                      ? formatPercentage(
                          heldConcentration.current.topHoldingPct,
                        )
                      : '—',
                    topFive: heldConcentration.current
                      ? formatPercentage(heldConcentration.current.topFivePct)
                      : '—',
                  })}
                </Layout>
              </Text>
            ) : (
              <Layout as="span" flow="block">
                {i18n.t(
                  'ui.overviewsummarycards.underlyingDetailUnavailableShowingHeldPositions',
                )}
              </Layout>
            )}
          </Stack>
        </Surface>
      </span>
    </CardShell>
  )
}
