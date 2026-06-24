import { ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { MonthlyTooltip } from './portfolioCharts.tooltips'
import type { MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { TrailingSavingCapacityPoint } from './portfolioCharts.logic'

export function MonthlySavingsChart({ data, ops }: { data: TrailingSavingCapacityPoint[]; ops: MonthlyOpsMap }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Savings capacity</h2>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 52, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tickFormatter={fmtEur} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmtEur} tick={{ fill: '#f59e0b', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={(props) => <MonthlyTooltip {...props} ops={ops} />} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'savings_delta' ? 'Monthly savings'
                : value === 'perf_delta' ? 'Market performance'
                : value === 'rolling_12m' ? 'Trailing 12m savings'
                : 'Trailing 12m performance'}
            </span>
          )} />
          <ReferenceLine yAxisId="left" y={0} stroke="#4b5563" />
          <Bar yAxisId="left" dataKey="savings_delta" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="perf_delta" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={(entry.perf_delta ?? 0) >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="rolling_12m" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
          <Line yAxisId="right" type="monotone" dataKey="rolling_perf_12m" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
