import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { TriTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import { buildTriChartData } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

// Fixed-window annualised IRRs, separate from the since-tracking KPI. Solid
// series start once their full trailing window is available; dotted leading
// segments extend their first values back to the beginning of the history.
export function TriChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  const chartData = buildTriChartData(history)
  if (chartData.length === 0) return null

  return (
    <div className="bg-surface rounded-xl p-4">
      <h2 className="mb-3 flex items-center text-sm font-medium text-content-muted">
        {i18n.t('ui.trichart.irrOverTimeTrailingAnnualised')}
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.trichart.annualizedMoneyWeightedReturnCalculatedOverRollingFixedWindows',
          )}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
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
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(value: number) =>
              formatPercentage(value, { decimals: 0 })
            }
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <ReferenceLine
            y={0}
            stroke={CHART_THEME.zeroLine}
            strokeDasharray="3 3"
          />
          <Tooltip content={<TriTooltip />} />
          <Line
            type="linear"
            dataKey="tri_rolling_1y_backfill"
            stroke={SEMANTIC_COLORS.totalChange}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="tri_rolling_1y"
            stroke={SEMANTIC_COLORS.totalChange}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="tri_rolling_3y_backfill"
            stroke={SEMANTIC_COLORS.returnRate}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="tri_rolling_3y"
            stroke={SEMANTIC_COLORS.returnRate}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-subtle">
        <span>
          <i
            className="mr-1.5 inline-block h-0.5 w-3 align-middle"
            style={{ backgroundColor: SEMANTIC_COLORS.totalChange }}
          />
          {i18n.t('ui.trichart.trailing1YearIrr')}
        </span>
        <span>
          <i
            className="mr-1.5 inline-block h-0.5 w-3 align-middle"
            style={{ backgroundColor: SEMANTIC_COLORS.returnRate }}
          />
          {i18n.t('ui.trichart.trailing3YearIrr')}
        </span>
      </div>
    </div>
  )
}
