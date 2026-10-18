import { createPortal } from 'react-dom'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { fmt } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { usePositionsHistory } from '@/hooks/usePositionsHistory'
import { computeMonthlyBalances, computePosition } from './hoverCharts.logic'
import { SavingsTooltip } from './hoverCharts.tooltips'

export interface SavingsChartTarget {
  name: string
  operations: { date: string; total_amount: number; operation_type: string }[]
  buttonRect: DOMRect
}

interface SavingsProps {
  target: SavingsChartTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function HoverSavingsChart({ target, onMouseEnter, onMouseLeave }: SavingsProps) {
  const history = usePositionsHistory(target.name)
  const { top, left } = computePosition(target.buttonRect)

  const chartData = history && history.length > 0
    ? history.map((p, i) => {
        const prev = history[i - 1]
        return {
          month: p.date.slice(0, 7),
          balance: Math.round(p.value),
          delta: prev ? Math.round(p.value - prev.value) : 0,
        }
      })
    : computeMonthlyBalances(target.operations)

  return createPortal(
    <div
      style={{ top, left, width: 480 }}
      className="fixed z-[9999] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3">
        <p className="text-white text-sm font-semibold">{target.name}</p>
        <p className="text-gray-500 text-xs">Balance over time</p>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SEMANTIC_COLORS.portfolioValue} stopOpacity={0.35} />
                <stop offset="95%" stopColor={SEMANTIC_COLORS.portfolioValue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
            <XAxis dataKey="month" tick={{ fill: CHART_THEME.tick, fontSize: 10 }} tickLine={false} />
            <YAxis
              tick={{ fill: CHART_THEME.tick, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmt.format(v)}
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
    document.body
  )
}
