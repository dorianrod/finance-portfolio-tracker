import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { TopPerformersTooltip } from './portfolioCharts.tooltips'
import type { TopPerformer } from './portfolioCharts.logic'

export function TopPerformersChart({ data, height }: { data: TopPerformer[]; height: number }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Performance by position</h2>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 64, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis type="category" dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={170} />
          <Tooltip content={<TopPerformersTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine x={0} stroke="#4b5563" />
          <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pct >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v: unknown) => `${(v as number) >= 0 ? '+' : ''}${(v as number).toFixed(0)}%`}
              style={{ fill: '#9ca3af', fontSize: 10 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
