import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { shortMonth } from '@/shared/format/money'
import { TriTooltip } from './portfolioCharts.tooltips'
import type { PortfolioHistoryPoint } from '@/types/history'

// Trailing 3-year annualised TRI, not since-inception: a since-inception XIRR
// evaluated shortly after the first deposit annualises a tiny elapsed time and
// explodes to meaningless magnitudes (e.g. a few % real gain over one month
// implies thousands of % per year). The rolling window only starts once a
// full 3 years of history exist, so this series stays in a readable range
// throughout. The "Global IRR" KPI is a separate, since-inception figure and
// is unaffected by this.
export function TriChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const data = history.filter((p) => p.tri_rolling_3y !== null)
  if (data.length === 0) return null

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">TRI over time (trailing 3-year, annualised)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v: number) => `${Math.round(v)}%`} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
          <Tooltip content={<TriTooltip />} />
          <Line type="monotone" dataKey="tri_rolling_3y" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2, fill: '#f59e0b' }} activeDot={{ r: 4 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
