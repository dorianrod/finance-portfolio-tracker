import {
  Bar,
  type BarShapeProps,
  CartesianGrid,
  ComposedChart,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { MonthlyTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import type { ChartShapeProps } from '@/shared/ui/chartShape'

export function MonthlySavingsChart({
  data,
  ops,
}: {
  data: TrailingSavingCapacityPoint[]
  ops: MonthlyOperationsByMonth
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  return (
    <div className="flex-1 bg-surface rounded-xl p-4">
      <h2 className="mb-3 flex items-center text-sm font-medium text-content-muted">
        {i18n.t('ui.monthlysavingschart.monthlyWealthDrivers')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.monthlysavingschart.monthlyNetContributionsAndMarketPerformanceWithARolling',
          )}
          scope={{ account: 'filterable', period: 'range-or-trailing-12m' }}
        />
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 52, left: 0, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              formatDate(value, { style: 'shortMonthShortYear' })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<MonthlyTooltip ops={ops} />} />
          <ReferenceLine yAxisId="left" y={0} stroke={CHART_THEME.zeroLine} />
          <Bar
            yAxisId="left"
            dataKey="savings_delta"
            fill={SEMANTIC_COLORS.netContributions}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="perf_delta"
            fill={SEMANTIC_COLORS.performancePositive}
            radius={[3, 3, 0, 0]}
            shape={(
              shapeProps: ChartShapeProps<
                BarShapeProps,
                TrailingSavingCapacityPoint
              >,
            ) => {
              const entry = shapeProps.payload
              if (!entry) return null
              return (
                <Rectangle
                  {...shapeProps}
                  fill={
                    (entry.perf_delta ?? 0) >= 0
                      ? SEMANTIC_COLORS.performancePositive
                      : SEMANTIC_COLORS.performanceNegative
                  }
                />
              )
            }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="rolling_12m"
            stroke={SEMANTIC_COLORS.netContributions}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: SEMANTIC_COLORS.netContributions }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="rolling_perf_12m"
            stroke={SEMANTIC_COLORS.performance}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: SEMANTIC_COLORS.performance }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-5 border-t border-border pt-3 text-xs text-content-subtle">
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
            {i18n.t('ui.monthlysavingschart.monthlyBars')}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-3 rounded-sm"
                style={{ backgroundColor: SEMANTIC_COLORS.netContributions }}
                aria-hidden="true"
              />
              <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-2.5 w-3 overflow-hidden rounded-sm"
                aria-hidden="true"
              >
                <i
                  className="h-full w-1/2"
                  style={{
                    backgroundColor: SEMANTIC_COLORS.performancePositive,
                  }}
                />
                <i
                  className="h-full w-1/2"
                  style={{
                    backgroundColor: SEMANTIC_COLORS.performanceNegative,
                  }}
                />
              </span>
              <span>{i18n.t('ui.monthlysavingschart.marketPerformance')}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
            {i18n.t('ui.monthlysavingschart.trailing12mLines')}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="h-0.5 w-4"
                style={{ backgroundColor: SEMANTIC_COLORS.netContributions }}
                aria-hidden="true"
              />
              <span>{i18n.t('ui.monthlysavingschart.netContributions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-0.5 w-4"
                style={{ backgroundColor: SEMANTIC_COLORS.performance }}
                aria-hidden="true"
              />
              <span>{i18n.t('ui.monthlysavingschart.marketPerformance')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
