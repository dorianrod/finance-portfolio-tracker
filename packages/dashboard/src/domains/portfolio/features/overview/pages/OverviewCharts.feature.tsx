import { useState } from 'react'
import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { toUtcDateTimestamp } from '@/domains/portfolio/features/overview/helpers/formatters/toUtcDateTimestamp'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type {
  OverviewComparison,
  OverviewConcentrationComparison,
} from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

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
    <section className="rounded-2xl border border-border bg-surface p-4 xl:col-span-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center text-sm font-semibold text-content-secondary">
            {i18n.t('ui.overviewcharts.portfolioValue')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
              )}
              scope={{ account: 'filterable', period: 'comparison-range' }}
            />
          </h3>
          <p className="mt-0.5 text-xs text-content-subtle">
            {i18n.t(
              'ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods',
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-content-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-content-subtle" />
            {i18n.t('ui.overviewcharts.previous')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-value" />
            {i18n.t('ui.overviewcharts.current')}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={chartData}
          margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            vertical={false}
          />
          <ReferenceArea
            x1={domain[0]}
            x2={currentStart}
            fill={SEMANTIC_COLORS.neutralSeries}
            fillOpacity={0.05}
          />
          <ReferenceArea
            x1={currentStart}
            x2={domain[1]}
            fill={SEMANTIC_COLORS.portfolioValue}
            fillOpacity={0.055}
          />
          <ReferenceLine
            x={currentStart}
            stroke={SEMANTIC_COLORS.portfolioValue}
            strokeOpacity={0.55}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={domain}
            tickFormatter={(value) =>
              formatDate(value, { style: 'dayMonthYear', timeZone: 'UTC' })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={44}
          />
          <YAxis
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={<ValueTooltip />}
            cursor={{ stroke: CHART_THEME.label, strokeOpacity: 0.25 }}
          />
          <Line
            type="monotone"
            dataKey="previousValue"
            stroke={SEMANTIC_COLORS.neutralSeries}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="currentValue"
            stroke={SEMANTIC_COLORS.portfolioValue}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
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
      color: SEMANTIC_COLORS.netContributions,
    },
    {
      label: i18n.t('ui.overviewcharts.marketPerformance'),
      previous: comparison.marketPerformance.previous,
      current: comparison.marketPerformance.current,
      color:
        comparison.marketPerformance.current != null &&
        comparison.marketPerformance.current < 0
          ? SEMANTIC_COLORS.performanceNegative
          : SEMANTIC_COLORS.performancePositive,
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
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2">
        <h3 className="flex items-center text-sm font-semibold text-content-secondary">
          {i18n.t('ui.overviewcharts.changeDrivers')}
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance',
            )}
            scope={{ account: 'filterable', period: 'comparison-range' }}
          />
        </h3>
        <p className="mt-0.5 text-xs text-content-subtle">
          {i18n.t(
            'ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance',
          )}
        </p>
      </div>
      <div className="mb-2 flex items-baseline justify-between gap-3 rounded-lg bg-canvas/45 px-3 py-2">
        <span className="text-[11px] text-content-subtle">
          {i18n.t('ui.overviewcharts.grossValueChange')}
        </span>
        <span className="text-sm font-semibold tabular-nums text-content-secondary">
          {currentChange == null
            ? '—'
            : `${currentChange > 0 ? '+' : ''}${formatMoney(currentChange)}`}{' '}
          <span className="ml-1 text-[10px] font-normal text-content-subtle">
            {i18n.t('ui.overviewcharts.vsWithValues', {
              value: formatMoney(previousChange, {
                fallback: i18n.t('ui.overviewcharts.unavailable'),
              }),
            })}
          </span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart
          data={rows}
          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          barGap={3}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <ReferenceLine y={0} stroke={CHART_THEME.zeroLine} />
          <Tooltip
            content={<DriversTooltip />}
            cursor={{ fill: CHART_THEME.cursor }}
          />
          <Bar
            dataKey="previous"
            name={i18n.t('ui.overviewcharts.previous')}
            fill={SEMANTIC_COLORS.neutralSeries}
            fillOpacity={0.45}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="current"
            name={i18n.t('ui.overviewcharts.current')}
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
            shape={CurrentDriverBar}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
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
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="flex items-center text-sm font-semibold text-content-secondary">
        {title}
        <ScopedInfoTooltip text={message} scope={scope} />
      </h3>
      <div className="flex h-52 items-center justify-center text-center text-sm text-content-subtle">
        {message}
      </div>
    </section>
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
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center text-sm font-semibold text-content-secondary">
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
          </h3>
          <p className="mt-0.5 text-xs text-content-subtle">
            {displayedMode === 'lookThrough'
              ? i18n.t(
                  'ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel',
                )
              : i18n.t(
                  'ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers',
                )}
          </p>
        </div>
        <ConcentrationModeToggle
          value={displayedMode}
          onChange={setMode}
          lookThroughDisabled={lookThroughDisabled}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center text-sm text-content-subtle">
          {i18n.t(
            'ui.overviewcharts.historicalConcentrationIsUnavailableForThisPeriod',
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((row) => (
            <OverviewConcentrationRow
              key={row.key}
              previousAvailable={previousAvailable}
              row={row}
              scaleMax={scaleMax}
            />
          ))}
          <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-content-subtle">
            <span className="h-3 w-0.5 bg-content-secondary" />{' '}
            {i18n.t('ui.overviewcharts.previousPeriodEnd')}
          </div>
        </div>
      )}
    </section>
  )
}

function CurrentDriverBar(
  shapeProps: ChartShapeProps<BarShapeProps, DriverRow>,
) {
  const row = shapeProps.payload
  if (!row) return null
  return <Rectangle {...shapeProps} fill={row.color} />
}
