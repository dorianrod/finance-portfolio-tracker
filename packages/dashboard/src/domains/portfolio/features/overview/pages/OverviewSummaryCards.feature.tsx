import { useFormatOverviewIrrValue } from '@/domains/portfolio/features/overview/helpers/formatters/useFormatOverviewIrrValue'
import type {
  ComparedMetric,
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { DeltaBadge } from '@/domains/portfolio/features/overview/pages/overviewMetrics/DeltaBadge.view'
import { OverviewMetric } from '@/domains/portfolio/features/overview/pages/overviewMetrics/OverviewMetric.view'
import { useOverviewNavigation } from '@/domains/portfolio/features/overview/services/actions/useOverviewNavigation'
import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
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

  const { navigateTo } = useOverviewNavigation()
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
      <OverviewMetric
        previousValue={formatMoney(comparison.value.previous, {
          fallback: i18n.t('ui.overviewsummarycards.unavailable'),
        })}
        value={formatMoney(comparison.value.current)}
      >
        <DeltaBadge metric={comparison.value} />
      </OverviewMetric>
      <Layout as="span" flow="block" spaceBefore="compact">
        <Surface as="span" variant="microFooter">
          <Stack as="span" gap="compact" spaceBefore="compact">
            <OverviewMetric.Secondary
              label={i18n.t('ui.overviewsummarycards.afterEstimatedTax')}
              value={formatMoney(comparison.netValue)}
            />
          </Stack>
        </Surface>
      </Layout>
    </OverviewCardShell>
  )
}

function OverviewContributionsCard({
  comparison,
}: Pick<SummaryCardsProps, 'comparison'>) {
  const scopeContext = useFilterScopeContext()

  const formatMoney = useFormatMoney()

  const { navigateTo } = useOverviewNavigation()
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
      <OverviewMetric
        previousValue={formatMoney(comparison.contributions.previous, {
          fallback: i18n.t('ui.overviewsummarycards.unavailable'),
        })}
        value={formatMoney(comparison.contributions.current)}
      >
        <DeltaBadge metric={comparison.contributions} />
      </OverviewMetric>
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
  const formatOverviewIrrValue = useFormatOverviewIrrValue()
  const { navigateTo } = useOverviewNavigation()
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
      <OverviewMetric
        previousValue={formatMoney(comparison.marketPerformance.previous, {
          fallback: i18n.t('ui.overviewsummarycards.unavailable'),
        })}
        value={formatMoney(comparison.marketPerformance.current)}
      >
        <DeltaBadge metric={comparison.marketPerformance} />
      </OverviewMetric>
      <Layout as="span" flow="block" spaceBefore="compact">
        <Surface as="span" variant="microFooter">
          <Stack as="span" gap="compact" spaceBefore="compact">
            <OverviewMetric.Secondary
              label={i18n.t('ui.overviewsummarycards.passiveIncome')}
              value={formatMoney(comparison.passiveIncome.current)}
            />
            <OverviewMetric.Secondary
              label={i18n.t('ui.overviewsummarycards.irrTrailing3y')}
              value={formatOverviewIrrValue(
                rollingThreeYearTri.current,
                irrStatus,
              )}
            >
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
            </OverviewMetric.Secondary>
          </Stack>
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

  const { navigateTo } = useOverviewNavigation()
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
      <Layout as="span" flow="grid" arrangement="comparison" gap="default">
        <OverviewMetric
          label={i18n.t('ui.overviewsummarycards.largestAsset')}
          previousValue={formatPercentage(
            primaryConcentration.topHolding.previous,
          )}
          value={formatPercentage(primaryConcentration.topHolding.current)}
        >
          <DeltaBadge
            metric={primaryConcentration.topHolding}
            tone="concentration"
          />
        </OverviewMetric>
        <OverviewMetric
          label={i18n.t('ui.overviewsummarycards.topFive')}
          previousValue={formatPercentage(
            primaryConcentration.topFive.previous,
          )}
          value={formatPercentage(primaryConcentration.topFive.current)}
        >
          <DeltaBadge
            metric={primaryConcentration.topFive}
            tone="concentration"
          />
        </OverviewMetric>
      </Layout>
      <Layout as="span" flow="block" spaceBefore="compact">
        <Surface as="span" variant="microFooter" tone="subtle">
          <Stack as="span" gap="compact" spaceBefore="compact">
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
