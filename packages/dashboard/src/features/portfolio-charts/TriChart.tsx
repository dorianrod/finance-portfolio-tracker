import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TriTooltip } from './portfolioCharts.tooltips'
import { buildTriChartData } from './portfolioCharts.logic'
import type { PortfolioHistoryPoint } from '@/types/history'

// Fixed-window annualised IRRs, separate from the since-tracking KPI. Solid
// series start once their full trailing window is available; dotted leading
// segments extend their first values back to the beginning of the history.
export function TriChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const chartData = buildTriChartData(history)
  if (chartData.length === 0) return null

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">IRR over time (trailing, annualised)</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v: number) => `${Math.round(v)}%`} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <ReferenceLine y={0} stroke={CHART_THEME.zeroLine} strokeDasharray="3 3" />
          <Tooltip content={<TriTooltip />} />
          <Line type="linear" dataKey="tri_rolling_1y_backfill" stroke={SEMANTIC_COLORS.totalChange} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={false} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="tri_rolling_1y" stroke={SEMANTIC_COLORS.totalChange} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
          <Line type="linear" dataKey="tri_rolling_3y_backfill" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={false} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="tri_rolling_3y" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span><i className="mr-1.5 inline-block h-0.5 w-3 align-middle" style={{ backgroundColor: SEMANTIC_COLORS.totalChange }} />Trailing 1-year IRR</span>
        <span><i className="mr-1.5 inline-block h-0.5 w-3 align-middle" style={{ backgroundColor: SEMANTIC_COLORS.returnRate }} />Trailing 3-year IRR</span>
      </div>
    </div>
  )
}
