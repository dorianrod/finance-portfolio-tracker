import type { ReactNode } from 'react'
import { BarChart, type BarShapeProps, ResponsiveContainer } from 'recharts'

import { TopPerformersTooltip } from '@/domains/portfolio/features/performance/components/performanceChartTooltips/TopPerformersTooltip.view'
import type { TopPerformer } from '@/domains/portfolio/features/performance/types/topPerformer.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLabels } from '@/shared/ui/chartLabels/ChartLabels.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function TopPerformersChart({
  data,
  height,
  children,
}: {
  data: TopPerformer[]
  height: number
  children: ReactNode
}) {
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.topperformerschart.performanceByAsset')}
            {children}
          </Inline>
        </Text>
      </Layout>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 64, left: 0, bottom: 0 }}
        >
          <ChartGrid horizontal={false} />
          <ChartXAxis
            type="number"
            tickFormatter={(value) =>
              formatPercentage(value, { decimals: 0, signed: true })
            }
          />
          <ChartYAxis type="category" dataKey="label" width={170} />
          <ChartTooltip highlight="bar">
            <TopPerformersTooltip />
          </ChartTooltip>
          <ChartReference x={0} kind="zero" />
          <SeriesBar dataKey="pct" corners="right">
            <SeriesBar.Shape>
              <PerformerBar />
            </SeriesBar.Shape>
            <ChartLabels
              position="right"
              label={(point: TopPerformer) =>
                formatPercentage(point.pct, {
                  decimals: 0,
                  signed: true,
                })
              }
            />
          </SeriesBar>
        </BarChart>
      </ResponsiveContainer>
    </Surface>
  )
}

function PerformerBar(
  shapeProps: Partial<ChartShapeProps<BarShapeProps, TopPerformer>>,
) {
  const entry = shapeProps.payload
  if (!entry) return null
  return (
    <ChartRectangle
      geometry={shapeProps}
      tone={
        entry.pct >= 0
          ? PORTFOLIO_CHART_TONES.performancePositive
          : PORTFOLIO_CHART_TONES.performanceNegative
      }
    />
  )
}
