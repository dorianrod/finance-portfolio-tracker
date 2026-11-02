import { useFormatOverviewIrrValue } from '@/domains/portfolio/features/overview/helpers/formatters/useFormatOverviewIrrValue'
import type {
  ComparedMetric,
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { getConcentrationTone } from '@/domains/portfolio/features/overview/pages/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/pages/helpers/presenters/getOverviewPerformanceTone'
import { DeltaBadge } from '@/domains/portfolio/features/overview/pages/overviewMetrics/DeltaBadge.view'
import { PreviousValue } from '@/domains/portfolio/features/overview/pages/overviewMetrics/PreviousValue.view'
import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { MetricDelta } from '@/shared/ui/badge/MetricDelta.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { OverviewCardShell } from './OverviewCardShell.view'

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

type SummaryCardsProps = {
  comparison: OverviewComparison
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
}

function OverviewValueCard({
  comparison,
}: Pick<SummaryCardsProps, 'comparison'>) {
  const scopeContext = useFilterScopeContext()

  const formatMoney = useFormatMoney()

  const { navigateTo } = useDashboardNavigation()
  const metricScope: FilterScopeSpec = {
    account: 'filterable',
    period: 'as-of',
    effectiveDate: comparison.windows.current.end,
  }
  return (
    <OverviewCardShell
      title={i18n.t('ui.overviewsummarycards.portfolioValue')}
      description={i18n.t(
        'ui.overviewsummarycards.grossMarketValueBeforeEstimatedTaxMeasuredAtThe',
      )}
      scope={metricScope}
      scopeContext={scopeContext}
      eyebrow={i18n.t('ui.overviewsummarycards.atPeriodEnd')}
      onOpen={() => navigateTo('wealth')}
      accent={'highlight'}
    >
      <Text variant="metric" tone="default" numeric>
        <Layout as="span" flow="block">
          {formatMoney(comparison.value.current)}
        </Layout>
      </Text>
      <Inline
        as="span"
        flow="wrap"
        align="center"
        gap="default"
        spaceBefore="default"
      >
        <DeltaBadge metric={comparison.value} />
        <PreviousValue value={comparison.value.previous} />
      </Inline>
      <Layout as="span" flow="block" spaceBefore="default">
        <Text variant="micro" tone="subtle">
          <Layout as="span" flow="block">
            {i18n.t(
              'ui.overviewsummarycards.grossMarketValueBeforeEstimatedTax',
            )}
          </Layout>
        </Text>
      </Layout>
    </OverviewCardShell>
  )
}

function OverviewContributionsCard({
  comparison,
}: Pick<SummaryCardsProps, 'comparison'>) {
  const scopeContext = useFilterScopeContext()

  const formatMoney = useFormatMoney()

  const { navigateTo } = useDashboardNavigation()
  const metricScope: FilterScopeSpec = {
    account: 'filterable',
    period: 'comparison-range',
  }
  return (
    <OverviewCardShell
      title={i18n.t('ui.overviewsummarycards.netContributions')}
      description={i18n.t(
        'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriodComparedWithThe',
      )}
      scope={metricScope}
      scopeContext={scopeContext}
      eyebrow={i18n.t('ui.overviewsummarycards.cashFlow')}
      onOpen={() => navigateTo('wealth')}
      accent="accent"
    >
      <Text variant="metric" tone="accent" numeric>
        <Layout as="span" flow="block">
          {formatMoney(comparison.contributions.current)}
        </Layout>
      </Text>
      <Inline
        as="span"
        flow="wrap"
        align="center"
        gap="default"
        spaceBefore="default"
      >
        <DeltaBadge metric={comparison.contributions} tone="contributions" />
        <PreviousValue value={comparison.contributions.previous} />
      </Inline>
      <Layout as="span" flow="block" spaceBefore="default">
        <Text variant="micro" tone="subtle">
          <Layout as="span" flow="block">
            {i18n.t(
              'ui.overviewsummarycards.depositsMinusWithdrawalsDuringThePeriod',
            )}
          </Layout>
        </Text>
      </Layout>
    </OverviewCardShell>
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
  const scopeContext = useFilterScopeContext()

  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const formatOverviewIrrValue = useFormatOverviewIrrValue()
  const rollingThreeYearDelta =
    irrStatus === 'ready' && rollingThreeYearTri.delta != null
      ? rollingThreeYearTri.delta
      : null

  const { navigateTo } = useDashboardNavigation()
  const metricScope: FilterScopeSpec = {
    account: 'filterable',
    period: 'comparison-range',
  }
  const trailingReturnScope: FilterScopeSpec = {
    account: 'filterable',
    period: 'trailing-3y',
    effectiveDate: comparison.windows.current.end,
  }
  return (
    <OverviewCardShell
      title={i18n.t('ui.overviewsummarycards.performanceIncome')}
      description={i18n.t(
        'ui.overviewsummarycards.marketPerformanceAndPassiveIncomeGeneratedDuringThePeriod',
      )}
      scope={metricScope}
      scopeContext={scopeContext}
      eyebrow={i18n.t('ui.overviewsummarycards.periodResult')}
      onOpen={() => navigateTo('performance')}
      accent="positive"
    >
      <Inline as="span" align="baseline" justify="between" gap="default">
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
      </Inline>
      <Layout as="span" flow="block" spaceBefore="default">
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
                    (
                    {formatMoney(comparison.passiveIncome.delta, {
                      signed: true,
                    })}
                    )
                  </Text>
                </Layout>
              )}
            </Text>
          </Inline>
        </Text>
      </Layout>
      <Layout as="span" flow="block" spaceBefore="default">
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
                <InfoTooltip
                  text={i18n.t(
                    'ui.overviewsummarycards.annualizedMoneyWeightedReturnOverTheThreeYearsEnding',
                  )}
                >
                  <InfoTooltip.Footer>
                    <FilterScopePresentation
                      scope={trailingReturnScope}
                      scopeContext={scopeContext}
                    />
                  </InfoTooltip.Footer>
                </InfoTooltip>
              </Surface>
            </Inline>
            <Text
              variant="strong"
              numeric
              tone={getOverviewPerformanceTone(rollingThreeYearTri.current)}
            >
              {formatOverviewIrrValue(rollingThreeYearTri.current, irrStatus)}
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
                {formatPercentage(
                  irrStatus === 'ready' ? rollingThreeYearTri.previous : null,
                  { decimals: 2, signed: true },
                )}
              </Text>
            </Text>
          </Inline>
        </Surface>
      </Layout>
    </OverviewCardShell>
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
  const scopeContext = useFilterScopeContext()

  const formatPercentage = useFormatPercentage()
  const underlyingAvailable = underlyingConcentration.current != null
  const primaryConcentration = underlyingAvailable
    ? underlyingConcentration
    : heldConcentration
  const primaryLabel = underlyingAvailable
    ? i18n.t('ui.overviewsummarycards.underlyingAssets')
    : i18n.t('ui.overviewsummarycards.heldPositionsLimitedView')

  const { navigateTo } = useDashboardNavigation()
  const metricScope: FilterScopeSpec = {
    account: 'filterable',
    period: 'as-of',
    effectiveDate: comparison.windows.current.end,
  }
  return (
    <OverviewCardShell
      title={i18n.t('ui.overviewsummarycards.concentration')}
      description={i18n.t(
        'ui.overviewsummarycards.shareOfThePortfolioRepresentedByTheLargestAsset',
      )}
      scope={metricScope}
      scopeContext={scopeContext}
      eyebrow={primaryLabel}
      onOpen={() => navigateTo('diversification')}
      accent={'attention'}
    >
      <Layout as="span" flow="grid" arrangement="comparison" gap="relaxed">
        <span>
          <Text variant="micro" tone="subtle">
            <Layout as="span" flow="block">
              {i18n.t('ui.overviewsummarycards.largestAsset')}
            </Layout>
          </Text>
          <Layout as="span" flow="block" spaceBefore="compact">
            <Text variant="metricSecondary" tone={'attention'} numeric>
              <Layout as="span" flow="block">
                {formatPercentage(primaryConcentration.current?.topHoldingPct)}
              </Layout>
            </Text>
          </Layout>
          <Layout as="span" flow="block" spaceBefore="compact">
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
          </Layout>
        </span>
        <span>
          <Text variant="micro" tone="subtle">
            <Layout as="span" flow="block">
              {i18n.t('ui.overviewsummarycards.topFive')}
            </Layout>
          </Text>
          <Layout as="span" flow="block" spaceBefore="compact">
            <Text variant="metricSecondary" tone={'attention'} numeric>
              <Layout as="span" flow="block">
                {formatPercentage(primaryConcentration.current?.topFivePct)}
              </Layout>
            </Text>
          </Layout>
          <Layout as="span" flow="block" spaceBefore="compact">
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
          </Layout>
        </span>
      </Layout>
      <Layout as="span" flow="block" spaceBefore="default">
        <Surface as="span" variant="microFooter" tone="subtle">
          <Stack as="span" gap="compact" inset="compact">
            {underlyingAvailable ? (
              <Text tone="subtle">
                <Layout as="span" flow="block">
                  {i18n.t('ui.overviewsummarycards.heldPositionsSummary', {
                    largest: formatPercentage(
                      heldConcentration.current?.topHoldingPct,
                    ),
                    topFive: formatPercentage(
                      heldConcentration.current?.topFivePct,
                    ),
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
      </Layout>
    </OverviewCardShell>
  )
}
