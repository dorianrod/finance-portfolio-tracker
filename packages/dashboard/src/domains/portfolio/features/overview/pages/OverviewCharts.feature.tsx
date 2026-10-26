import { useState } from 'react'
import {
  BarChart,
  type BarShapeProps,
  LineChart,
  ResponsiveContainer,
} from 'recharts'

import type {
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison'
import { toUtcDateTimestamp } from '@/domains/portfolio/features/overview/helpers/formatters/toUtcDateTimestamp'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartXAxis } from '@/shared/ui/ChartAxes.view'
import { ChartGrid, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReferenceArea } from '@/shared/ui/ChartReference.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

import {
  DriversTooltip,
  OverviewConcentrationRow,
  ValueTooltip,
} from './OverviewChartDetails.view'

export function OverviewValueChart({
  comparison,
}: {
  comparison: OverviewComparison
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const chartData = comparison.valueHistory.map((point) => ({
    ...point,
    timestamp: toUtcDateTimestamp(point.date),
    previousValue: point.window === 'previous' ? point.value : null,
    currentValue: point.window === 'current' ? point.value : null,
  }))
  if (chartData.length === 0) {
    return (
      <EmptyChart
        title={i18n.t('ui.overviewcharts.portfolioValue')}
        message={i18n.t(
          'ui.overviewcharts.noValueHistoryIsAvailableForThesePeriods',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
      />
    )
  }
  const domain: [number, number] = [
    toUtcDateTimestamp(comparison.windows.previous.start),
    toUtcDateTimestamp(comparison.windows.current.end),
  ]
  const currentStart = toUtcDateTimestamp(comparison.windows.current.start)

  return (
    <div className="xl:col-span-2">
      <Surface as="section" variant="panel">
        <Inline
          as="div"
          flow="wrap"
          spaceAfter="spacious"
          align="start"
          justify="between"
          gap="default"
        >
          <div>
            <Text as="h3" variant="bodyStrong" tone="secondary">
              <Inline as="span" align="center">
                {i18n.t('ui.overviewcharts.portfolioValue')}
                <ScopedInfoTooltip
                  text={i18n.t(
                    'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
                  )}
                  scope={{
                    account: 'filterable',
                    period: 'comparison-range',
                  }}
                />
              </Inline>
            </Text>
            <Layout spaceBefore="compact">
              <Text as="p" variant="caption" tone="subtle">
                {i18n.t(
                  'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
                )}
              </Text>
            </Layout>
          </div>
          <Text as="div" variant="micro" tone="subtle">
            <Inline as="div" align="center" gap="default">
              <Inline as="span" align="center" gap="compact">
                <Layout
                  as="span"
                  flow="inline"
                  height="indicator"
                  width="indicator"
                >
                  <ToneSwatch tone="subtle" shape="dot" />
                </Layout>
                {i18n.t('ui.overviewcharts.previous')}
              </Inline>
              <Inline as="span" align="center" gap="compact">
                <Layout
                  as="span"
                  flow="inline"
                  height="indicator"
                  width="indicator"
                >
                  <ToneSwatch tone={'highlight'} shape="dot" />
                </Layout>
                {i18n.t('ui.overviewcharts.current')}
              </Inline>
            </Inline>
          </Text>
        </Inline>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={chartData}
            margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
          >
            <ChartGrid vertical={false} />
            <ChartReferenceArea
              x1={domain[0]}
              x2={currentStart}
              prominence="muted"
            />
            <ChartReferenceArea
              x1={currentStart}
              x2={domain[1]}
              prominence="highlighted"
            />
            <ChartReference x={currentStart} kind="selected" />
            <ChartXAxis
              density="compact"
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={domain}
              tickFormatter={(value) =>
                formatDate(value, { style: 'dayMonthYear', timeZone: 'UTC' })
              }
              minTickGap={44}
            />
            <ChartYAxis
              tickFormatter={(value) =>
                formatMoney(value, { style: 'compact' })
              }
              width={52}
              domain={['auto', 'auto']}
            />
            <ChartTooltip highlight="line">
              <ValueTooltip />
            </ChartTooltip>
            <SeriesLine
              type="monotone"
              dataKey="previousValue"
              tone={PORTFOLIO_CHART_TONES.neutralSeries}
              weight="regular"
              markers="hidden"
              hover="default"
              motion="none"
            />
            <SeriesLine
              type="monotone"
              dataKey="currentValue"
              tone={PORTFOLIO_CHART_TONES.portfolioValue}
              weight="emphasized"
              markers="hidden"
              hover="default"
              motion="none"
            />
          </LineChart>
        </ResponsiveContainer>
      </Surface>
    </div>
  )
}

export function OverviewDriversChart({
  comparison,
}: {
  comparison: OverviewComparison
}) {
  const formatMoney = useFormatMoney()
  const rows: DriverRow[] = [
    {
      label: i18n.t('ui.overviewcharts.netContributions'),
      previous: comparison.contributions.previous,
      current: comparison.contributions.current,
      tone: PORTFOLIO_CHART_TONES.netContributions,
    },
    {
      label: i18n.t('ui.overviewcharts.marketPerformance'),
      previous: comparison.marketPerformance.previous,
      current: comparison.marketPerformance.current,
      tone:
        comparison.marketPerformance.current != null &&
        comparison.marketPerformance.current < 0
          ? PORTFOLIO_CHART_TONES.performanceNegative
          : PORTFOLIO_CHART_TONES.performancePositive,
    },
  ]
  const unavailable =
    comparison.contributions.current == null &&
    comparison.marketPerformance.current == null
  if (unavailable)
    return (
      <EmptyChart
        title={i18n.t('ui.overviewcharts.changeDrivers')}
        message={i18n.t(
          'ui.overviewcharts.noCashFlowHistoryIsAvailableForThisPeriod',
        )}
        scope={{ account: 'filterable', period: 'comparison-range' }}
      />
    )
  const currentChange =
    comparison.contributions.current == null ||
    comparison.marketPerformance.current == null
      ? null
      : comparison.contributions.current + comparison.marketPerformance.current
  const previousChange =
    comparison.contributions.previous == null ||
    comparison.marketPerformance.previous == null
      ? null
      : comparison.contributions.previous +
        comparison.marketPerformance.previous

  return (
    <Surface as="section" variant="panel">
      <Layout spaceAfter="default">
        <Text as="h3" variant="bodyStrong" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.overviewcharts.changeDrivers')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance',
              )}
              scope={{ account: 'filterable', period: 'comparison-range' }}
            />
          </Inline>
        </Text>
        <Layout spaceBefore="compact">
          <Text as="p" variant="caption" tone="subtle">
            {i18n.t(
              'ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance',
            )}
          </Text>
        </Layout>
      </Layout>
      <Layout spaceAfter="default">
        <Surface variant="subduedInset">
          <Inline
            as="div"
            align="baseline"
            justify="between"
            gap="default"
            inset="compact"
          >
            <Text variant="micro" tone="subtle">
              {i18n.t('ui.overviewcharts.grossValueChange')}
            </Text>
            <Text variant="bodyStrong" tone="secondary" numeric>
              {currentChange == null
                ? '—'
                : `${currentChange > 0 ? '+' : ''}${formatMoney(currentChange)}`}{' '}
              <Layout as="span" flow="inline">
                <Text variant="tinyRegular" tone="subtle">
                  {i18n.t('ui.overviewcharts.vsWithValues', {
                    value: formatMoney(previousChange, {
                      fallback: i18n.t('ui.overviewcharts.unavailable'),
                    }),
                  })}
                </Text>
              </Layout>
            </Text>
          </Inline>
        </Surface>
      </Layout>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart
          data={rows}
          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          barGap={3}
        >
          <ChartGrid vertical={false} />
          <ChartXAxis density="compact" dataKey="label" />
          <ChartYAxis
            density="compact"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            width={48}
          />
          <ChartReference y={0} kind="zero" />
          <ChartTooltip highlight="bar">
            <DriversTooltip />
          </ChartTooltip>
          <SeriesBar
            dataKey="previous"
            name={i18n.t('ui.overviewcharts.previous')}
            tone={PORTFOLIO_CHART_TONES.neutralSeries}
            corners="top"
            prominence="muted"
            motion="none"
          />
          <SeriesBar
            dataKey="current"
            name={i18n.t('ui.overviewcharts.current')}
            corners="top"
            motion="none"
          >
            <SeriesBar.Shape>
              <CurrentDriverBar />
            </SeriesBar.Shape>
          </SeriesBar>
        </BarChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function EmptyChart({
  title,
  message,
  scope,
}: {
  title: string
  message: string
  scope: FilterScopeSpec
}) {
  return (
    <Surface as="section" variant="panel">
      <Text as="h3" variant="bodyStrong" tone="secondary">
        <Inline as="span" align="center">
          {title}
          <ScopedInfoTooltip text={message} scope={scope} />
        </Inline>
      </Text>
      <Layout height="chart">
        <Text as="div" variant="body" tone="subtle" align="center">
          <Inline as="div" align="center" justify="center">
            {message}
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}

export function OverviewConcentrationChart({
  heldConcentration,
  underlyingConcentration,
}: {
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
}) {
  const [mode, setMode] = useState<ConcentrationMode>('lookThrough')
  const lookThroughDisabled = underlyingConcentration.current == null
  const displayedMode =
    mode === 'lookThrough' && lookThroughDisabled ? 'held' : mode
  const concentration =
    displayedMode === 'held' ? heldConcentration : underlyingConcentration
  const current = concentration.current
  const previousByKey = new Map(
    concentration.previous?.holdings.map((holding) => [
      holding.key,
      holding.weight,
    ]) ?? [],
  )
  const rows =
    current?.holdings.slice(0, 5).map((holding) => ({
      ...holding,
      previousWeight: concentration.previous
        ? (previousByKey.get(holding.key) ?? 0)
        : null,
    })) ?? []
  const scaleMax = Math.max(
    1,
    ...rows.flatMap((row) => [row.weight, row.previousWeight ?? 0]),
  )
  const previousAvailable = concentration.previous != null

  return (
    <Surface as="section" variant="panel">
      <Stack gap="default" align="start" justify="between">
        <div>
          <Text as="h3" variant="bodyStrong" tone="secondary">
            <Inline as="span" align="center">
              {displayedMode === 'lookThrough'
                ? i18n.t('ui.overviewcharts.largestUnderlyingAssets')
                : i18n.t('ui.overviewcharts.largestHeldPositions')}
              <ScopedInfoTooltip
                // eslint-disable-next-line local/no-prop-drilling -- Mode-specific chart copy is owned by this feature.
                text={
                  displayedMode === 'lookThrough'
                    ? i18n.t(
                        'ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel',
                      )
                    : i18n.t(
                        'ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers',
                      )
                }
                // eslint-disable-next-line local/no-prop-drilling -- This feature owns the effective concentration snapshot scope.
                scope={{
                  account: 'filterable',
                  period: 'as-of',
                  effectiveDate: concentration.current?.date,
                }}
              />
            </Inline>
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {displayedMode === 'lookThrough'
                ? i18n.t(
                    'ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel',
                  )
                : i18n.t(
                    'ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers',
                  )}
            </Text>
          </Layout>
        </div>
        <ConcentrationModeToggle
          value={displayedMode}
          onChange={setMode}
          lookThroughDisabled={lookThroughDisabled}
        />
      </Stack>
      {rows.length === 0 ? (
        <Layout height="chart">
          <Text as="div" variant="body" tone="subtle" align="center">
            <Inline as="div" align="center" justify="center">
              {i18n.t(
                'ui.overviewcharts.historicalConcentrationIsUnavailableForThisPeriod',
              )}
            </Inline>
          </Text>
        </Layout>
      ) : (
        <Stack spaceBefore="spacious" gap="relaxed">
          {rows.map((row) => (
            <OverviewConcentrationRow
              key={row.key}
              previousAvailable={previousAvailable}
              row={row}
              scaleMax={scaleMax}
            />
          ))}
          <Text as="div" variant="tiny" tone="subtle">
            <Inline
              as="div"
              align="center"
              justify="end"
              gap="compact"
              inset="compact"
            >
              <Layout as="span" flow="inline" height="marker" width="divider">
                <ToneSwatch tone="secondary" />
              </Layout>{' '}
              {i18n.t('ui.overviewcharts.previousPeriodEnd')}
            </Inline>
          </Text>
        </Stack>
      )}
    </Surface>
  )
}

function CurrentDriverBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, DriverRow>>,
) {
  const row = shapeProps.payload
  if (!row) return null
  return <ChartRectangle geometry={shapeProps} tone={row.tone} />
}
