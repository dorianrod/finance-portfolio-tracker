import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { fmtEur } from '@/shared/format/money'
import { PassiveIncomeTooltip } from './portfolioCharts.tooltips'
import type { PassiveIncomePoint } from '@/hooks/usePassiveIncome'

export function PassiveIncomeChart({ data }: { data: PassiveIncomePoint[] }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Passive income per year</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={fmtEur} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<PassiveIncomeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'dividends' ? 'Dividends' : 'Interest'}
            </span>
          )} />
          <Bar dataKey="dividends" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]}>
            <LabelList dataKey="dividends" position="inside" formatter={(v: unknown) => fmtEur(v as number)} style={{ fill: '#fff', fontSize: 10 }} />
          </Bar>
          <Bar dataKey="interest" stackId="a" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
