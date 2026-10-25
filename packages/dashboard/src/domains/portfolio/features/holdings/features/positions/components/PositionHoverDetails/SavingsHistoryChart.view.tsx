import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { SavingsTooltip } from './hoverCharts.tooltips.view'

export function SavingsHistoryChart({
  chartData,
}: {
  chartData: { month: string; balance: number; delta: number }[]
}) {
  const formatMoney = useFormatMoney()
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={SEMANTIC_COLORS.portfolioValue}
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor={SEMANTIC_COLORS.portfolioValue}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
        <XAxis
          dataKey="month"
          tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatMoney(value)}
          width={64}
        />
        <Tooltip content={<SavingsTooltip />} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={SEMANTIC_COLORS.portfolioValue}
          strokeWidth={2}
          fill="url(#gSavings)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
