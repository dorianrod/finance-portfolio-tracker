import i18n from '@/i18n/i18n'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ConcentrationMode } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { OverviewConcentrationComparison, OverviewComparison } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { toUtcDateTimestamp } from '@/domains/portfolio/features/overview/helpers/formatters/toUtcDateTimestamp'

function ValueTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: { timestamp: number; value: number; window: 'previous' | 'current' } }>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <TooltipBox minWidth={190}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>{formatDate(point.timestamp, { style: 'dayMonthYear', timeZone: 'UTC' })}</div>
      <div className="mt-1 tabular-nums" style={{ color: 'var(--tooltip-label)' }}>{formatMoney(point.value)}</div>
      <div className="mt-1 text-xs capitalize" style={{ color: 'var(--tooltip-dim)' }}>{point.window}  {i18n.t('ui.overviewcharts.period')}</div>
    </TooltipBox>
  )
}

export function OverviewValueChart({ comparison }: { comparison: OverviewComparison }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const chartData = comparison.valueHistory.map((point) => ({
    ...point,
    timestamp: toUtcDateTimestamp(point.date),
    previousValue: point.window === 'previous' ? point.value : null,
    currentValue: point.window === 'current' ? point.value : null,
  }))
  if (chartData.length === 0) {
    return <EmptyChart title={i18n.t('ui.overviewcharts.portfolioValue')} message={i18n.t('ui.overviewcharts.noValueHistoryIsAvailableForThesePeriods')} scope={{ account: 'filterable', period: 'comparison-range' }} />
  }
  const domain: [number, number] = [toUtcDateTimestamp(comparison.windows.previous.start), toUtcDateTimestamp(comparison.windows.current.end)]
  const currentStart = toUtcDateTimestamp(comparison.windows.current.start)

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4 xl:col-span-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center text-sm font-semibold text-gray-200">{i18n.t('ui.overviewcharts.portfolioValue')}<ScopedInfoTooltip text={i18n.t('ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods')} scope={{ account: 'filterable', period: 'comparison-range' }} /></h3>
          <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.overviewcharts.grossMarketValueAcrossThePreviousAndCurrentPeriods')}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-600" />{i18n.t('ui.overviewcharts.previous')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" />{i18n.t('ui.overviewcharts.current')}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <ReferenceArea x1={domain[0]} x2={currentStart} fill={SEMANTIC_COLORS.neutralSeries} fillOpacity={0.05} />
          <ReferenceArea x1={currentStart} x2={domain[1]} fill={SEMANTIC_COLORS.portfolioValue} fillOpacity={0.055} />
          <ReferenceLine x={currentStart} stroke={SEMANTIC_COLORS.portfolioValue} strokeOpacity={0.55} strokeDasharray="4 4" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={domain}
            tickFormatter={(value) => formatDate(value, { style: 'dayMonthYear', timeZone: 'UTC' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={44}
          />
          <YAxis tickFormatter={(value) => formatMoney(value, { style: 'compact' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} domain={['auto', 'auto']} />
          <Tooltip content={<ValueTooltip />} cursor={{ stroke: CHART_THEME.label, strokeOpacity: 0.25 }} />
          <Line type="monotone" dataKey="previousValue" stroke={SEMANTIC_COLORS.neutralSeries} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="currentValue" stroke={SEMANTIC_COLORS.portfolioValue} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

interface DriverRow {
  label: string
  previous: number | null
  current: number | null
  color: string
}

function DriversTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number | null; payload: DriverRow }>
}) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <TooltipBox minWidth={205}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>{row.label}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between gap-6" style={{ color: 'var(--tooltip-dim)' }}><span>{i18n.t('ui.overviewcharts.current')}</span><span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>{row.current == null ? i18n.t('ui.overviewcharts.unavailable') : formatMoney(row.current)}</span></div>
        <div className="flex justify-between gap-6" style={{ color: 'var(--tooltip-dim)' }}><span>{i18n.t('ui.overviewcharts.previous')}</span><span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>{row.previous == null ? i18n.t('ui.overviewcharts.unavailable') : formatMoney(row.previous)}</span></div>
        <div className="flex justify-between gap-6 border-t pt-1" style={{ color: 'var(--tooltip-dim)', borderColor: 'var(--tooltip-border)' }}><span>{i18n.t('ui.overviewcharts.difference')}</span><span className="tabular-nums" style={{ color: 'var(--tooltip-label)' }}>{row.current == null || row.previous == null ? i18n.t('ui.overviewcharts.unavailable') : `${row.current - row.previous > 0 ? '+' : ''}${formatMoney(row.current - row.previous)}`}</span></div>
      </div>
    </TooltipBox>
  )
}

export function OverviewDriversChart({ comparison }: { comparison: OverviewComparison }) {
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
      color: comparison.marketPerformance.current != null && comparison.marketPerformance.current < 0
        ? SEMANTIC_COLORS.performanceNegative
        : SEMANTIC_COLORS.performancePositive,
    },
  ]
  const unavailable = comparison.contributions.current == null && comparison.marketPerformance.current == null
  if (unavailable) return <EmptyChart title={i18n.t('ui.overviewcharts.changeDrivers')} message={i18n.t('ui.overviewcharts.noCashFlowHistoryIsAvailableForThisPeriod')} scope={{ account: 'filterable', period: 'comparison-range' }} />
  const currentChange = comparison.contributions.current == null || comparison.marketPerformance.current == null
    ? null
    : comparison.contributions.current + comparison.marketPerformance.current
  const previousChange = comparison.contributions.previous == null || comparison.marketPerformance.previous == null
    ? null
    : comparison.contributions.previous + comparison.marketPerformance.previous

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2">
        <h3 className="flex items-center text-sm font-semibold text-gray-200">{i18n.t('ui.overviewcharts.changeDrivers')}<ScopedInfoTooltip text={i18n.t('ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance')} scope={{ account: 'filterable', period: 'comparison-range' }} /></h3>
        <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.overviewcharts.grossMovementFromContributionsAndMarketPerformance')}</p>
      </div>
      <div className="mb-2 flex items-baseline justify-between gap-3 rounded-lg bg-gray-950/45 px-3 py-2">
        <span className="text-[11px] text-gray-600">{i18n.t('ui.overviewcharts.grossValueChange')}</span>
        <span className="text-sm font-semibold tabular-nums text-gray-200">{currentChange == null ? '—' : `${currentChange > 0 ? '+' : ''}${formatMoney(currentChange)}`} <span className="ml-1 text-[10px] font-normal text-gray-600">{i18n.t('ui.overviewcharts.vs')} {previousChange == null ? i18n.t('ui.overviewcharts.unavailable') : formatMoney(previousChange)}</span></span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatMoney(value, { style: 'compact' })} tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} axisLine={false} width={48} />
          <ReferenceLine y={0} stroke={CHART_THEME.zeroLine} />
          <Tooltip content={<DriversTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
          <Bar dataKey="previous" name={i18n.t('ui.overviewcharts.previous')} fill={SEMANTIC_COLORS.neutralSeries} fillOpacity={0.45} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="current" name={i18n.t('ui.overviewcharts.current')} radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {rows.map((row) => <Cell key={row.label} fill={row.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

function EmptyChart({ title, message, scope }: { title: string; message: string; scope: FilterScopeSpec }) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="flex items-center text-sm font-semibold text-gray-200">{title}<ScopedInfoTooltip text={message} scope={scope} /></h3>
      <div className="flex h-52 items-center justify-center text-center text-sm text-gray-600">{message}</div>
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
  const displayedMode = mode === 'lookThrough' && lookThroughDisabled ? 'held' : mode
  const concentration = displayedMode === 'held'
    ? heldConcentration
    : underlyingConcentration
  const current = concentration.current
  const previousByKey = new Map(concentration.previous?.holdings.map((holding) => [holding.key, holding.weight]) ?? [])
  const rows = current?.holdings.slice(0, 5).map((holding) => ({
    ...holding,
    previousWeight: concentration.previous ? previousByKey.get(holding.key) ?? 0 : null,
  })) ?? []
  const scaleMax = Math.max(1, ...rows.flatMap((row) => [row.weight, row.previousWeight ?? 0]))
  const previousAvailable = concentration.previous != null

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center text-sm font-semibold text-gray-200">
            {displayedMode === 'lookThrough' ? i18n.t('ui.overviewcharts.largestUnderlyingAssets') : i18n.t('ui.overviewcharts.largestHeldPositions')}
            <ScopedInfoTooltip
              // eslint-disable-next-line local/no-prop-drilling -- Mode-specific chart copy is owned by this feature.
              text={displayedMode === 'lookThrough' ? i18n.t('ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel') : i18n.t('ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers')}
              // eslint-disable-next-line local/no-prop-drilling -- This feature owns the effective concentration snapshot scope.
              scope={{ account: 'filterable', period: 'as-of', effectiveDate: concentration.current?.date }}
            />
          </h3>
          <p className="mt-0.5 text-xs text-gray-600">
            {displayedMode === 'lookThrough'
              ? i18n.t('ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel')
              : i18n.t('ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers')}
          </p>
        </div>
        <ConcentrationModeToggle value={displayedMode} onChange={setMode} lookThroughDisabled={lookThroughDisabled} />
      </div>
      {rows.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center text-sm text-gray-600">{i18n.t('ui.overviewcharts.historicalConcentrationIsUnavailableForThisPeriod')}</div>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((row) => <OverviewConcentrationRow key={row.key} previousAvailable={previousAvailable} row={row} scaleMax={scaleMax} />)}
          <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-gray-600">
            <span className="h-3 w-0.5 bg-gray-300" />  {i18n.t('ui.overviewcharts.previousPeriodEnd')}
          </div>
        </div>
      )}
    </section>
  )
}

type OverviewConcentrationRowData = NonNullable<OverviewConcentrationComparison['current']>['holdings'][number] & { previousWeight: number | null }

function OverviewConcentrationRow({ previousAvailable, row, scaleMax }: { previousAvailable: boolean; row: OverviewConcentrationRowData; scaleMax: number }) {
  const formatPercentage = useFormatPercentage()
  const delta = row.previousWeight == null ? null : row.weight - row.previousWeight
  let deltaTone = 'text-gray-600'
  if (delta != null && delta > 0) deltaTone = 'text-red-400'
  else if (delta != null && delta < 0) deltaTone = 'text-emerald-400'
  return <div><div className="mb-1.5 flex items-center gap-3 text-xs"><span className="min-w-0 flex-1 truncate font-medium text-gray-300" title={row.name}>{row.label}</span><span className="shrink-0 tabular-nums text-gray-300">{formatPercentage(row.weight)}</span><span className={`w-14 shrink-0 text-right text-[10px] font-medium tabular-nums ${deltaTone}`}>{delta == null ? '—' : formatPercentage(delta, { signed: true, unit: ' pp' })}</span></div><div className="relative h-2.5 rounded-full bg-gray-800"><div className="absolute inset-y-0 left-0 rounded-full bg-orange-500/80" style={{ width: `${row.weight / scaleMax * 100}%` }} />{previousAvailable && <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-gray-300 shadow-[0_0_0_1px_var(--color-gray-900)]" style={{ left: `${(row.previousWeight ?? 0) / scaleMax * 100}%` }} title={i18n.t('ui.overviewcharts.previousValue0', { value0: formatPercentage(row.previousWeight ?? 0) })} />}</div></div>
}
