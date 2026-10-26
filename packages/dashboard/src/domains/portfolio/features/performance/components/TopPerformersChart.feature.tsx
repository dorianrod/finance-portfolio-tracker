import { BarChart, type BarShapeProps, ResponsiveContainer } from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { TopPerformersTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { TopPerformer } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartGrid, ChartXAxis, ChartYAxis } from '@/shared/ui/ChartAxes.view'
import { ChartLabels } from '@/shared/ui/ChartLabels.view'
import { ChartRectangle } from '@/shared/ui/ChartRectangle.view'
import { ChartReference } from '@/shared/ui/ChartReference.view'
import type { ChartShapeProps } from '@/shared/ui/chartShape'
import { ChartTooltip } from '@/shared/ui/ChartTooltip.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function TopPerformersChart({
  data,
  height,
}: {
  data: TopPerformer[]
  height: number
}) {
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="chart">
      <Layout spaceAfter="default">
        <Text as="h2" variant="label" tone="muted">
          <Inline as="span" align="center">
            {i18n.t('ui.topperformerschart.performanceByAsset')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.topperformerschart.grossUnrealizedPerformanceByCurrentlyHeldAsset',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
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
              dataKey="pct"
              position="right"
              formatter={(value: unknown) =>
                formatPercentage(value as number, {
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
      tone={entry.pct >= 0 ? PORTFOLIO_CHART_TONES.performancePositive : PORTFOLIO_CHART_TONES.performanceNegative}
    />
  )
}
