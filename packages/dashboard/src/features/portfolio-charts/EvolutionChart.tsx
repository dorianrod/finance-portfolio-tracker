import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { ChartScaleToggle, type ChartScaleMode } from '@/shared/ui/ChartScaleToggle'
import { EvolutionTooltip } from './portfolioCharts.tooltips'
import { PORTFOLIO_COST_SHARE_KEY, PORTFOLIO_GAIN_SHARE_KEY, withPortfolioComposition } from './chartScale.logic'
import type { PortfolioHistoryPoint } from '@/types/history'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'

export function EvolutionChart({ history, title = 'Portfolio value over time', height = 220 }: {
  history: PortfolioHistoryPoint[]
  title?: string
  height?: number
}) {
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(() => withPortfolioComposition(history), [history])

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-gray-400">{title}<InfoTooltip text="Portfolio market value over time, split between cost basis and gross unrealized profit or loss." scope={{ account: 'filterable', period: 'range' }} /></h2>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart key={scale} data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          <YAxis
            tickFormatter={percentageMode ? (value) => `${Math.round(Number(value))}%` : fmtEur}
            domain={percentageMode ? ['auto', 'auto'] : undefined}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={percentageMode ? 48 : 52}
          />
          <Tooltip content={<EvolutionTooltip percentageMode={percentageMode} />} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'Cost basis' ? 'Cost basis' : 'Unrealized P&L'}
            </span>
          )} />
          <Area type="monotone" dataKey={percentageMode ? PORTFOLIO_COST_SHARE_KEY : 'total_cost_basis'} name="Cost basis" stackId="a" stroke={SEMANTIC_COLORS.costBasis} fill="url(#gradCost)" strokeWidth={1.5} />
          <Area type="monotone" dataKey={percentageMode ? PORTFOLIO_GAIN_SHARE_KEY : 'unrealized_gain'} name="Unrealized P&L" stackId="a" stroke={SEMANTIC_COLORS.performancePositive} fill="url(#gradGain)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
