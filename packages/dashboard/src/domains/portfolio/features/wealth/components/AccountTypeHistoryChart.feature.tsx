import i18n from '@/i18n/i18n'
import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { typeColor } from '@/shared/theme/chartColors'
import { ChartScaleToggle, type ChartScaleMode } from '@/shared/ui/ChartScaleToggle.view'
import { AccountTypeHistoryTooltip } from '@/domains/portfolio/shared/components/PortfolioChartTooltips.view'
import { accountTypeShareKey, withAccountTypeShares } from '@/domains/portfolio/features/wealth/helpers/mappers/buildChartScaleData'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'

function AccountTypeGradient({ accountType, index, typeCategories }: { accountType: string; index: number; typeCategories: Record<string, string> }) {
  const color = typeColor(accountType, index, typeCategories)
  return <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.7} /><stop offset="95%" stopColor={color} stopOpacity={0.15} /></linearGradient>
}

function AccountTypeArea({ accountType, index, percentageMode, typeCategories }: { accountType: string; index: number; percentageMode: boolean; typeCategories: Record<string, string> }) {
  return <Area type="monotone" dataKey={percentageMode ? accountTypeShareKey(index) : accountType} name={accountType} stackId="a" stroke={typeColor(accountType, index, typeCategories)} fill={`url(#grad-${index})`} strokeWidth={1.5} />
}

export function AccountTypeHistoryChart({
  data, accountTypes, typeCategories,
}: {
  data: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const [scale, setScale] = useState<ChartScaleMode>('value')
  const percentageMode = scale === 'percentage'
  const chartData = useMemo(() => withAccountTypeShares(data, accountTypes), [data, accountTypes])

  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="flex items-center text-sm font-medium text-gray-400">{i18n.t('ui.accounttypehistorychart.accountTypeOverTime')}<ScopedInfoTooltip text={i18n.t('ui.accounttypehistorychart.evolutionOfPortfolioValueByAccountTypeShownAs')} scope={{ account: 'filterable', period: 'range' }} /></h2>
        <ChartScaleToggle value={scale} onChange={setScale} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart key={scale} data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {accountTypes.map((accountType, index) => <AccountTypeGradient key={accountType} accountType={accountType} index={index} typeCategories={typeCategories} />)}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="date" tickFormatter={(value) => formatDate(value, { style: 'shortMonthShortYear' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={percentageMode ? (value) => `${Math.round(Number(value))}%` : (value) => formatMoney(value, { style: 'compact' })} domain={percentageMode ? [0, 100] : undefined} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={percentageMode ? 48 : 52} />
          <Tooltip content={<AccountTypeHistoryTooltip accountTypes={accountTypes} typeCategories={typeCategories} percentageMode={percentageMode} />} />
          <Legend formatter={(value) => <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>{value}</span>} />
          {accountTypes.map((accountType, index) => <AccountTypeArea key={accountType} accountType={accountType} index={index} percentageMode={percentageMode} typeCategories={typeCategories} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
