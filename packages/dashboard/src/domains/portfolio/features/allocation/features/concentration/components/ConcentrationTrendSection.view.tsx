import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  matchByDataKey,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { HoldingLabelTick } from '@/domains/portfolio/features/allocation/features/concentration/components/HoldingLabelTick.view'
import { interpolateRankedBars } from '@/domains/portfolio/features/allocation/features/concentration/helpers/presenters/rankedBarAnimation'
import type { useConcentrationTrendController } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationTrendController'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import {
  ChartLegend,
  ConcentrationTrendTooltip,
  HistoricalHoldingTooltip,
} from './ConcentrationTrendTooltips.view'

const matchHoldingByKey = matchByDataKey('key')

export function ConcentrationTrendSectionView({
  controller,
  lookThroughAvailable,
  children,
}: {
  children: ReactNode
  controller: ReturnType<typeof useConcentrationTrendController>
  lookThroughAvailable: boolean
}) {
  const { slot: thresholdTooltip, content: afterThresholdTooltip } =
    partitionSlot(children, ConcentrationTrendSectionViewThresholdTooltip)
  const { slot: holdingsTooltip } = partitionSlot(
    afterThresholdTooltip,
    ConcentrationTrendSectionViewHoldingsTooltip,
  )
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const {
    animationEnabled,
    changeMode,
    chartData,
    dateDomain,
    displayedHoldings,
    displayedPoint,
    isPlaying,
    mode,
    points,
    selectHoveredPoint,
    selectPoint,
    selectedIndex,
    selectedTimestamp,
    setHoveredPointIndex,
    togglePlayback,
  } = controller

  const heading =
    mode === 'held'
      ? i18n.t('ui.concentrationtrendsection.heldPositionConcentration')
      : i18n.t('ui.concentrationtrendsection.underlyingConcentration')
  const description =
    mode === 'held'
      ? i18n.t(
          'ui.concentrationtrendsection.trackHowManyOfTheLargestHeldPositionsAccount',
        )
      : i18n.t(
          'ui.concentrationtrendsection.trackIdentifiedDirectAndFundLookThroughExposureMissing',
        )

  if (points.length < 2) {
    return (
      <section>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-content-secondary">
              {heading}
            </h3>
            <p className="mt-0.5 text-xs text-content-subtle">{description}</p>
          </div>
          <ConcentrationModeToggle
            value={mode}
            onChange={changeMode}
            lookThroughDisabled={!lookThroughAvailable}
          />
        </div>
        {!lookThroughAvailable && (
          <p className="mb-3 text-xs text-warning">
            {i18n.t(
              'ui.concentrationtrendsection.lookThroughHistoryIsUnavailableUntilFundHoldingsHistory',
            )}
          </p>
        )}
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-content-subtle">
          {i18n.t(
            'ui.concentrationtrendsection.notEnoughConcentrationHistoryForTheCurrentSelection',
          )}
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-content-secondary">
            {heading}
          </h3>
          <p className="mt-0.5 text-xs text-content-subtle">{description}</p>
          {!lookThroughAvailable && (
            <p className="mt-1 text-xs text-warning">
              {i18n.t(
                'ui.concentrationtrendsection.lookThroughHistoryIsUnavailableUntilFundHoldingsHistory',
              )}
            </p>
          )}
        </div>
        <ConcentrationModeToggle
          value={mode}
          onChange={changeMode}
          lookThroughDisabled={!lookThroughAvailable}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-1 flex items-center text-sm font-medium text-content-muted">
            {i18n.t(
              'ui.concentrationtrendsection.minimumPositionsToReachPortfolioShare',
            )}
            {thresholdTooltip}
          </h2>
          <p className="mb-3 text-xs text-content-subtle">
            {i18n.t(
              'ui.concentrationtrendsection.unavailableThresholdsAppearAsGapsWhenIdentifiedExposureCannot',
            )}
          </p>
          <ChartLegend />
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive)
                  selectHoveredPoint(state.activeTooltipIndex)
              }}
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={dateDomain}
                tickFormatter={(value) =>
                  formatDate(value, { style: 'shortMonthShortYear' })
                }
                tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 'auto']}
                allowDecimals={false}
                tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              {selectedTimestamp != null && (
                <ReferenceLine
                  x={selectedTimestamp}
                  stroke={CHART_THEME.label}
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip content={<ConcentrationTrendTooltip />} />
              <Line
                type="stepAfter"
                dataKey="positionsTo25Pct"
                stroke={SEMANTIC_COLORS.risk}
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 1 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="positionsTo50Pct"
                stroke={SEMANTIC_COLORS.totalChange}
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 1 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="positionsTo75Pct"
                stroke={SEMANTIC_COLORS.netContributions}
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 1 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="positionsTo90Pct"
                stroke={SEMANTIC_COLORS.portfolioValue}
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 1 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {displayedPoint && (
          <div className="rounded-xl bg-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center text-sm font-medium text-content-secondary">
                  {i18n.t(
                    'ui.concentrationtrendsection.largestHoldingsOverTime',
                  )}
                  {holdingsTooltip}
                </h2>
                <p className="mt-0.5 text-xs text-content-subtle">
                  {i18n.t(
                    'ui.concentrationtrendsection.hoverToPreviewTheSliderAndPlaybackUseEvery',
                  )}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-lg font-semibold tabular-nums text-content-secondary">
                  {formatDate(displayedPoint.date, {
                    style: 'shortMonthShortYear',
                  })}
                </div>
                <div className="text-[11px] text-content-subtle">
                  {i18n.t('ui.concentrationtrendsection.snapshotWithValues', {
                    date: formatDate(displayedPoint.date, { style: 'isoDate' }),
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-content-subtle">
              <span>
                {i18n.t('ui.concentrationtrendsection.coverage.80e135')}{' '}
                <strong className="font-semibold text-content-secondary">
                  {formatPercentage(displayedPoint.coveragePct)}
                </strong>
              </span>
              <span>
                {i18n.t('ui.concentrationtrendsection.identified')}{' '}
                <strong className="font-semibold text-content-secondary">
                  {formatMoney(displayedPoint.identifiedValue, {
                    style: 'full',
                  })}
                </strong>
              </span>
              <span>
                {i18n.t('ui.concentrationtrendsection.undisclosedFunds')}{' '}
                <strong className="font-semibold text-content-secondary">
                  {formatMoney(displayedPoint.undisclosedValue, {
                    style: 'full',
                  })}
                </strong>
              </span>
              <span>
                {i18n.t('ui.concentrationtrendsection.opaque')}{' '}
                <strong className="font-semibold text-content-secondary">
                  {formatMoney(displayedPoint.opaqueValue, { style: 'full' })}
                </strong>
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={
                  isPlaying
                    ? i18n.t(
                        'ui.concentrationtrendsection.pauseConcentrationHistory',
                      )
                    : i18n.t(
                        'ui.concentrationtrendsection.playConcentrationHistory',
                      )
                }
                aria-pressed={isPlaying}
                onClick={togglePlayback}
                className="rounded-md bg-accent-solid px-3 py-1.5 text-xs font-medium text-on-accent"
              >
                {isPlaying
                  ? i18n.t('ui.concentrationtrendsection.pause')
                  : i18n.t('ui.concentrationtrendsection.play')}
              </button>
              <button
                type="button"
                aria-label={i18n.t(
                  'ui.concentrationtrendsection.previousConcentrationMonth',
                )}
                disabled={selectedIndex === 0}
                onClick={() => selectPoint(selectedIndex - 1)}
                className="rounded-md border border-border-strong px-2.5 py-1.5 text-xs text-content-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {i18n.t('ui.concentrationtrendsection.previous')}
              </button>
              <button
                type="button"
                aria-label={i18n.t(
                  'ui.concentrationtrendsection.nextConcentrationMonth',
                )}
                disabled={selectedIndex >= points.length - 1}
                onClick={() => selectPoint(selectedIndex + 1)}
                className="rounded-md border border-border-strong px-2.5 py-1.5 text-xs text-content-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {i18n.t('ui.concentrationtrendsection.next')}
              </button>
              <label className="ml-0 flex min-w-[220px] flex-1 items-center gap-3 text-[11px] text-content-subtle sm:ml-2">
                <span>
                  {formatDate(points[0].date, { style: 'shortMonthShortYear' })}
                </span>
                <input
                  aria-label={i18n.t(
                    'ui.concentrationtrendsection.concentrationMonth',
                  )}
                  type="range"
                  min={0}
                  max={points.length - 1}
                  step={1}
                  value={selectedIndex}
                  onChange={(event) => selectPoint(Number(event.target.value))}
                  className="min-w-0 flex-1 accent-accent"
                />
                <span>
                  {formatDate(points.at(-1)!.date, {
                    style: 'shortMonthShortYear',
                  })}
                </span>
              </label>
            </div>

            <div className="mt-3 overflow-x-auto">
              <div className="min-w-[520px]">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(280, displayedHoldings.length * 30)}
                >
                  <BarChart
                    layout="vertical"
                    data={displayedHoldings}
                    margin={{ top: 4, right: 52, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_THEME.grid}
                      horizontal={false}
                    />
                    <XAxis type="number" domain={[0, 'dataMax']} hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      tick={<HoldingLabelTick />}
                      tickLine={false}
                      axisLine={false}
                      width={260}
                    />
                    <Tooltip
                      content={<HistoricalHoldingTooltip />}
                      cursor={{ fill: CHART_THEME.cursor }}
                    />
                    <Bar
                      dataKey="weight"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={animationEnabled}
                      animationDuration={450}
                      animationEasing="ease-in-out"
                      animationMatchBy={matchHoldingByKey}
                      animationInterpolateFn={interpolateRankedBars}
                      shape={(shapeProps: BarShapeProps) => {
                        return (
                          <Rectangle
                            {...shapeProps}
                            fill={
                              shapeProps.index === 0
                                ? SEMANTIC_COLORS.risk
                                : SEMANTIC_COLORS.neutralSeries
                            }
                          />
                        )
                      }}
                    >
                      <LabelList
                        dataKey="weight"
                        position="right"
                        formatter={(value: unknown) =>
                          formatPercentage(Number(value))
                        }
                        style={{ fill: 'var(--chart-label)', fontSize: 11 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function ConcentrationTrendSectionViewThresholdTooltip({
  children,
}: {
  children: ReactNode
}) {
  return children
}

ConcentrationTrendSectionView.ThresholdTooltip =
  ConcentrationTrendSectionViewThresholdTooltip

function ConcentrationTrendSectionViewHoldingsTooltip({
  children,
}: {
  children: ReactNode
}) {
  return children
}

ConcentrationTrendSectionView.HoldingsTooltip =
  ConcentrationTrendSectionViewHoldingsTooltip
