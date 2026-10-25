import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  LabelList,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { TopPerformersTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { TopPerformer } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

export function TopPerformersChart({
  data,
  height,
}: {
  data: TopPerformer[]
  height: number
}) {
  const formatPercentage = useFormatPercentage()
  return (
    <div className="bg-surface rounded-xl p-4">
      <h2 className="mb-3 flex items-center text-sm font-medium text-content-muted">
        {i18n.t('ui.topperformerschart.performanceByAsset')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.topperformerschart.grossUnrealizedPerformanceByCurrentlyHeldAsset',
          )}
          scope={{ account: 'filterable', period: 'as-of' }}
        />
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 64, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.grid}
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              formatPercentage(value, { decimals: 0, signed: true })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={170}
          />
          <Tooltip
            content={<TopPerformersTooltip />}
            cursor={{ fill: CHART_THEME.cursor }}
          />
          <ReferenceLine x={0} stroke={CHART_THEME.zeroLine} />
          <Bar
            dataKey="pct"
            radius={[0, 3, 3, 0]}
            shape={(
              shapeProps: ChartShapeProps<BarShapeProps, TopPerformer>,
            ) => {
              const entry = shapeProps.payload
              if (!entry) return null
              return (
                <Rectangle
                  {...shapeProps}
                  fill={
                    entry.pct >= 0
                      ? SEMANTIC_COLORS.performancePositive
                      : SEMANTIC_COLORS.performanceNegative
                  }
                />
              )
            }}
          >
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(value: unknown) =>
                formatPercentage(value as number, { decimals: 0, signed: true })
              }
              style={{ fill: CHART_THEME.tick, fontSize: 10 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
