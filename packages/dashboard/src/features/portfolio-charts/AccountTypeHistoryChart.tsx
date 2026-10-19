import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { typeColor } from '@/shared/format/colors'
import { ChartScaleToggle, type ChartScaleMode } from '@/shared/ui/ChartScaleToggle'
import { AccountTypeHistoryTooltip } from './portfolioCharts.tooltips'
import { accountTypeShareKey, withAccountTypeShares } from './chartScale.logic'
import type { AccountTypeHistoryPoint } from '@/hooks/useAccountTypeHistory'

export function AccountTypeHistoryChart({
  data, accountTypes, typeCategories,
}: {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}) {
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(() => withAccountTypeShares(data, accountTypes), [data, accountTypes])

  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-sm font-medium text-gray-400">Account type over time</h2>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart key={scale} data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {accountTypes.map((t, i) => (
              <linearGradient key={t} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={typeColor(t, i, typeCategories)} stopOpacity={0.7} />
                <stop offset="95%" stopColor={typeColor(t, i, typeCategories)} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={percentageMode ? (value) => `${Math.round(Number(value))}%` : fmtEur} domain={percentageMode ? [0, 100] : undefined} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={percentageMode ? 48 : 52} />
          <Tooltip content={(props) => <AccountTypeHistoryTooltip {...props} accountTypes={accountTypes} typeCategories={typeCategories} percentageMode={percentageMode} />} />
          <Legend formatter={(value) => <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>{value}</span>} />
          {accountTypes.map((t, i) => (
            <Area
              key={t}
              type="monotone"
              dataKey={percentageMode ? accountTypeShareKey(i) : t}
              name={t}
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
