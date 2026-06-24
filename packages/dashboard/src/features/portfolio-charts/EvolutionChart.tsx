import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { EvolutionTooltip } from './portfolioCharts.tooltips'
import type { PortfolioHistoryPoint } from '@/types/history'

export function EvolutionChart({ history }: { history: PortfolioHistoryPoint[] }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Portfolio value over time</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="gradGain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtEur} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<EvolutionTooltip />} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'total_cost_basis' ? 'Purchase value' : 'Unrealized P&L'}
            </span>
          )} />
          <Area type="monotone" dataKey="total_cost_basis" stackId="a" stroke="#3b82f6" fill="url(#gradCost)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="unrealized_gain"  stackId="a" stroke="#22c55e" fill="url(#gradGain)"  strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
