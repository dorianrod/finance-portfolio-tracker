import type { ReactNode } from 'react'
import {
  BarChart,
  type BarShapeProps,
  LineChart,
  matchByDataKey,
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
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Button, Input, ToggleButton } from '@/shared/ui/Controls.view'
import { Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { SeriesLine } from '@/shared/ui/SeriesLine.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

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
            <Text as="h3" variant="label" tone="secondary">
              {heading}
            </Text>
            <div className="mt-0.5">
              <Text as="p" variant="caption" tone="subtle">
                {description}
              </Text>
            </div>
          </div>
          <ConcentrationModeToggle
            value={mode}
            onChange={changeMode}
            lookThroughDisabled={!lookThroughAvailable}
          />
        </div>
        {!lookThroughAvailable && (
          <div className="mb-3">
            <Text as="p" variant="caption" tone="warning">
              {i18n.t(
                'ui.concentrationtrendsection.lookThroughHistoryIsUnavailableUntilFundHoldingsHistory',
              )}
            </Text>
          </div>
        )}
        <Surface variant="contentCard" tone="subtle" align="center">
          {i18n.t(
            'ui.concentrationtrendsection.notEnoughConcentrationHistoryForTheCurrentSelection',
          )}
        </Surface>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <Text as="h3" variant="label" tone="secondary">
            {heading}
          </Text>
          <div className="mt-0.5">
            <Text as="p" variant="caption" tone="subtle">
              {description}
            </Text>
          </div>
          {!lookThroughAvailable && (
            <div className="mt-1">
              <Text as="p" variant="caption" tone="warning">
                {i18n.t(
                  'ui.concentrationtrendsection.lookThroughHistoryIsUnavailableUntilFundHoldingsHistory',
                )}
              </Text>
            </div>
          )}
        </div>
        <ConcentrationModeToggle
          value={mode}
          onChange={changeMode}
          lookThroughDisabled={!lookThroughAvailable}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Surface variant="chart">
          <Layout spaceAfter="compact">
            <Text as="h2" variant="label" tone="muted">
              <Inline as="span" align="center">
                {i18n.t(
                  'ui.concentrationtrendsection.minimumPositionsToReachPortfolioShare',
                )}
                {thresholdTooltip}
              </Inline>
            </Text>
          </Layout>
          <Layout spaceAfter="default">
            <Text as="p" variant="caption" tone="subtle">
              {i18n.t(
                'ui.concentrationtrendsection.unavailableThresholdsAppearAsGapsWhenIdentifiedExposureCannot',
              )}
            </Text>
          </Layout>
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
              <ChartGrid />
              <ChartXAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={dateDomain}
                tickFormatter={(value) =>
                  formatDate(value, { style: 'shortMonthShortYear' })
                }
              />
              <ChartYAxis
                domain={[0, 'auto']}
                allowDecimals={false}
                width={32}
              />
              {selectedTimestamp != null && (
                <ChartReference x={selectedTimestamp} kind="crosshair" />
              )}
              <Tooltip content={<ConcentrationTrendTooltip />} />
              <SeriesLine
                type="stepAfter"
                dataKey="positionsTo25Pct"
                connectNulls={false}
                tone="risk"
                weight="emphasized"
                markers="tiny"
                motion="none"
              />
              <SeriesLine
                type="stepAfter"
                dataKey="positionsTo50Pct"
                connectNulls={false}
                tone="totalChange"
                weight="regular"
                markers="tiny"
                motion="none"
              />
              <SeriesLine
                type="stepAfter"
                dataKey="positionsTo75Pct"
                connectNulls={false}
                tone="netContributions"
                weight="regular"
                markers="tiny"
                motion="none"
              />
              <SeriesLine
                type="stepAfter"
                dataKey="positionsTo90Pct"
                connectNulls={false}
                tone="portfolioValue"
                weight="regular"
                markers="tiny"
                motion="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </Surface>

        {displayedPoint && (
          <Surface variant="chart">
            <Stack gap="default" align="start" justify="between">
              <div>
                <Text as="h2" variant="label" tone="secondary">
                  <Inline as="span" align="center">
                    {i18n.t(
                      'ui.concentrationtrendsection.largestHoldingsOverTime',
                    )}
                    {holdingsTooltip}
                  </Inline>
                </Text>
                <Layout spaceBefore="compact">
                  <Text as="p" variant="caption" tone="subtle">
                    {i18n.t(
                      'ui.concentrationtrendsection.hoverToPreviewTheSliderAndPlaybackUseEvery',
                    )}
                  </Text>
                </Layout>
              </div>
              <Text variant="responsiveEnd" as="div" align="left">
                <Text as="div" variant="statistic" tone="secondary" numeric>
                  {formatDate(displayedPoint.date, {
                    style: 'shortMonthShortYear',
                  })}
                </Text>
                <Text as="div" variant="micro" tone="subtle">
                  {i18n.t('ui.concentrationtrendsection.snapshotWithValues', {
                    date: formatDate(displayedPoint.date, {
                      style: 'isoDate',
                    }),
                  })}
                </Text>
              </Text>
            </Stack>

            <Layout spaceBefore="default">
              <Text as="div" variant="micro" tone="subtle">
                <Inline as="div" flow="wrap" gap="compact">
                  <span>
                    {i18n.t('ui.concentrationtrendsection.coverage.80e135')}{' '}
                    <Text as="strong" variant="strong" tone="secondary">
                      {formatPercentage(displayedPoint.coveragePct)}
                    </Text>
                  </span>
                  <span>
                    {i18n.t('ui.concentrationtrendsection.identified')}{' '}
                    <Text as="strong" variant="strong" tone="secondary">
                      {formatMoney(displayedPoint.identifiedValue, {
                        style: 'full',
                      })}
                    </Text>
                  </span>
                  <span>
                    {i18n.t('ui.concentrationtrendsection.undisclosedFunds')}{' '}
                    <Text as="strong" variant="strong" tone="secondary">
                      {formatMoney(displayedPoint.undisclosedValue, {
                        style: 'full',
                      })}
                    </Text>
                  </span>
                  <span>
                    {i18n.t('ui.concentrationtrendsection.opaque')}{' '}
                    <Text as="strong" variant="strong" tone="secondary">
                      {formatMoney(displayedPoint.opaqueValue, {
                        style: 'full',
                      })}
                    </Text>
                  </span>
                </Inline>
              </Text>
            </Layout>

            <Inline
              as="div"
              flow="wrap"
              spaceBefore="spacious"
              align="center"
              gap="default"
            >
              <ToggleButton
                type="button"
                label={
                  isPlaying
                    ? i18n.t(
                        'ui.concentrationtrendsection.pauseConcentrationHistory',
                      )
                    : i18n.t(
                        'ui.concentrationtrendsection.playConcentrationHistory',
                      )
                }
                active={isPlaying}
                onClick={togglePlayback}
                variant="primaryCompact"
              >
                {isPlaying
                  ? i18n.t('ui.concentrationtrendsection.pause')
                  : i18n.t('ui.concentrationtrendsection.play')}
              </ToggleButton>
              <Button
                type="button"
                label={i18n.t(
                  'ui.concentrationtrendsection.previousConcentrationMonth',
                )}
                disabled={selectedIndex === 0}
                onClick={() => selectPoint(selectedIndex - 1)}
                variant="outlinedCompact"
              >
                {i18n.t('ui.concentrationtrendsection.previous')}
              </Button>
              <Button
                type="button"
                label={i18n.t(
                  'ui.concentrationtrendsection.nextConcentrationMonth',
                )}
                disabled={selectedIndex >= points.length - 1}
                onClick={() => selectPoint(selectedIndex + 1)}
                variant="outlinedCompact"
              >
                {i18n.t('ui.concentrationtrendsection.next')}
              </Button>
              <Layout sizing="flexible">
                <Text as="label" variant="micro" tone="subtle">
                  <Inline as="span" align="center" gap="default">
                    <span>
                      {formatDate(points[0].date, {
                        style: 'shortMonthShortYear',
                      })}
                    </span>
                    <Layout as="span" flow="control" sizing="flexible">
                      <Input
                        label={i18n.t(
                          'ui.concentrationtrendsection.concentrationMonth',
                        )}
                        type="range"
                        min={0}
                        max={points.length - 1}
                        step={1}
                        value={selectedIndex}
                        onChange={(event) =>
                          selectPoint(Number(event.target.value))
                        }
                        variant="timeline"
                      />
                    </Layout>
                    <span>
                      {formatDate(points.at(-1)!.date, {
                        style: 'shortMonthShortYear',
                      })}
                    </span>
                  </Inline>
                </Text>
              </Layout>
            </Inline>

            <Layout spaceBefore="default" overflow="auto">
              <Layout>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(280, displayedHoldings.length * 30)}
                >
                  <BarChart
                    layout="vertical"
                    data={displayedHoldings}
                    margin={{ top: 4, right: 52, left: 8, bottom: 0 }}
                  >
                    <ChartGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax']} hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      tick={<HoldingLabelTick />}
                      tickLine={false}
                      axisLine={false}
                      width={260}
                    />
                    <ChartTooltip highlight="bar">
                      <HistoricalHoldingTooltip />
                    </ChartTooltip>
                    <SeriesBar
                      dataKey="weight"
                      animationMatchBy={matchHoldingByKey}
                      animationInterpolateFn={interpolateRankedBars}
                      corners="wideRight"
                      motion="selection"
                      transitioning={animationEnabled}
                    >
                      <SeriesBar.Shape>
                        <LeadingHoldingBar />
                      </SeriesBar.Shape>
                      <ChartLabels
                        dataKey="weight"
                        position="right"
                        formatter={(value: unknown) =>
                          formatPercentage(Number(value))
                        }
                        density="standard"
                      />
                    </SeriesBar>
                  </BarChart>
                </ResponsiveContainer>
              </Layout>
            </Layout>
          </Surface>
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

function LeadingHoldingBar(shapeProps: Partial<BarShapeProps>) {
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={shapeProps.index === 0 ? 'risk' : 'neutralSeries'}
    />
  )
}
