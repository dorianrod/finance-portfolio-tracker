import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { EvolutionTooltip } from './portfolioCharts.tooltips'
import type { PortfolioHistoryPoint } from '@/types/history'

export function EvolutionChart({ history, title = 'Portfolio value over time', height = 220 }: {
  history: PortfolioHistoryPoint[]
  title?: string
  height?: number
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={SEMANTIC_COLORS.costBasis} stopOpacity={0.6} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.costBasis} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="gradGain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={SEMANTIC_COLORS.performancePositive} stopOpacity={0.7} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.performancePositive} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<EvolutionTooltip />} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'total_cost_basis' ? 'Cost basis' : 'Unrealized P&L'}
            </span>
          )} />
          <Area type="monotone" dataKey="total_cost_basis" stackId="a" stroke={SEMANTIC_COLORS.costBasis} fill="url(#gradCost)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="unrealized_gain"  stackId="a" stroke={SEMANTIC_COLORS.performancePositive} fill="url(#gradGain)"  strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
