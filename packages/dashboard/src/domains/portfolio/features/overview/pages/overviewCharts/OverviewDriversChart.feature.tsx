import { BarChart, type BarShapeProps, ResponsiveContainer } from 'recharts'

import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { DriversTooltip } from '@/domains/portfolio/features/overview/pages/overviewChartDetails/DriversTooltip.view'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { EmptyChart } from './EmptyChart.feature'

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

function CurrentDriverBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, DriverRow>>,
) {
  const row = shapeProps.payload
  if (!row) return null
  return <ChartRectangle geometry={shapeProps} tone={row.tone} />
}
