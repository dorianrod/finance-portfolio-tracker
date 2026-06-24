import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { typeColor } from '@/shared/format/colors'
import { AccountTypeHistoryTooltip } from './portfolioCharts.tooltips'
import type { AccountTypeHistoryPoint } from '@/hooks/useAccountTypeHistory'

export function AccountTypeHistoryChart({
  data, accountTypes, typeCategories,
}: {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Account type over time</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {accountTypes.map((t, i) => (
              <linearGradient key={t} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={typeColor(t, i, typeCategories)} stopOpacity={0.7} />
                <stop offset="95%" stopColor={typeColor(t, i, typeCategories)} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtEur} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={(props) => <AccountTypeHistoryTooltip {...props} accountTypes={accountTypes} typeCategories={typeCategories} />} />
          <Legend formatter={(value) => <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>{value}</span>} />
          {accountTypes.map((t, i) => (
            <Area
              key={t}
              type="monotone"
              dataKey={t}
              stackId="a"
              stroke={typeColor(t, i, typeCategories)}
              fill={`url(#grad-${i})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
