import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtEur } from '@/shared/format/money'
import { AccountTypeTooltip } from './portfolioCharts.tooltips'
import type { AccountTypePointWithLabel } from './portfolioCharts.logic'

export function AccountTypeBreakdownChart({ data }: { data: AccountTypePointWithLabel[] }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Breakdown by account type</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart layout="vertical" data={data} margin={{ top: 4, right: 88, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis type="number" tickFormatter={fmtEur} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="account_type" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
          <Tooltip content={<AccountTypeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="total_cost_basis" stackId="a" fill="#3b82f6" name="Cost basis" />
          <Bar dataKey="unrealized_gain" stackId="a" name="Unrealized" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.unrealized_gain >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
            <LabelList dataKey="_label" position="right" style={{ fill: '#9ca3af', fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
