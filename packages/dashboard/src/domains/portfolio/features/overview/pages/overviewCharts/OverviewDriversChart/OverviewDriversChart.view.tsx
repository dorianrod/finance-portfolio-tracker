import type { ReactNode } from 'react'
import { BarChart, type BarShapeProps, ResponsiveContainer } from 'recharts'

import { DriversTooltip } from '@/domains/portfolio/features/overview/pages/overviewChartDetails/DriversTooltip.view'
import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
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

import type { buildOverviewDriverPresentation } from './helpers/presenters/buildOverviewDriverPresentation'

export function OverviewDriversChartView({
  presentation,
  children,
}: {
  presentation: ReturnType<typeof buildOverviewDriverPresentation>
  children: ReactNode
}) {
  const formatMoney = useFormatMoney()
  const { rows, currentChange, previousChange } = presentation
  return (
    <Surface as="section" variant="panel">
      <Layout spaceAfter="default">
        <Text as="h3" variant="bodyStrong" tone="secondary">
          <Inline as="span" align="center">
            {i18n.t('ui.overviewcharts.changeDrivers')}
            {children}
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
              {formatMoney(currentChange, { signed: true })}{' '}
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
