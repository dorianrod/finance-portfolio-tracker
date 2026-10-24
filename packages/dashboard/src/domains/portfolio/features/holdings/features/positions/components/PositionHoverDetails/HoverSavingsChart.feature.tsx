import { createPortal } from 'react-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  computeMonthlyBalances,
  computePosition,
} from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { usePositionHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePositionHistoryQuery'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { SavingsTooltip } from './hoverCharts.tooltips.view'

export type SavingsChartTarget = {
  name: string
  operations: { date: Date; total_amount: number; operation_type: string }[]
  buttonRect: DOMRect
}

type SavingsProps = {
  target: SavingsChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverSavingsChart({
  target,
  onMouseEnter,
  onMouseLeave,
}: SavingsProps) {
  const formatMoney = useFormatMoney()
  const { data: history } = usePositionHistoryQuery(target.name)
  const { top, left } = computePosition(target.buttonRect)

  const chartData =
    history && history.length > 0
      ? history.map((p, i) => {
          const prev = history[i - 1]
          return {
            month: toCalendarMonth(p.date),
            balance: Math.round(p.value),
            delta: prev ? Math.round(p.value - prev.value) : 0,
          }
        })
      : computeMonthlyBalances(target.operations)

  return createPortal(
    <div
      style={{ top, left, width: 480 }}
      className="fixed z-[9999] bg-surface border border-border-strong rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-content text-sm font-semibold">{target.name}</p>
        <p className="text-content-subtle text-xs">
          {i18n.t('ui.hoversavingschart.balanceOverTime')}
        </p>
      </div>

      {chartData.length > 0 && (
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
      )}
    </div>,
    document.body,
  )
}
