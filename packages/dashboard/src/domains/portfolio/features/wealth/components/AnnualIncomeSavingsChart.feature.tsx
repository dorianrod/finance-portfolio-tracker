import { getIncomeYearOpacity } from '@/domains/portfolio/features/wealth/helpers/presenters/getIncomeYearOpacity'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { IncomeSavingsTooltip } from './IncomeSavingsTooltip.view'

export function AnnualIncomeSavingsChart({ data }: { data: AnnualIncomeSavingsPoint[] }) {
  const formatMoney = useFormatMoney()
  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="mb-3 flex items-start gap-3">
        <div>
          <h2 className="flex items-center text-sm font-medium text-content-secondary">
            {i18n.t('ui.annualincomesavingschart.incomeVsNetContributions')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.annualincomesavingschart.annualDeclaredIncomeComparedWithDepositsMinusWithdrawalsAcross',
              )}
              scope={{ account: 'global', period: 'year-range' }}
            />
          </h2>
          <p className="mt-1 text-xs text-content-subtle">
            {i18n.t('ui.annualincomesavingschart.annualAllAccounts')}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={285}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis
            dataKey="year"
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="amount"
            tickFormatter={(value) => formatMoney(value, { style: 'compact' })}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<IncomeSavingsTooltip />} />
          <Bar
            yAxisId="amount"
            dataKey="netSalary"
            stackId="income"
            fill={SEMANTIC_COLORS.costBasis}
            radius={[0, 0, 3, 3]}
          >
            {data.map((point) => (
              <Cell key={point.year} fillOpacity={getIncomeYearOpacity(point)} />
            ))}
          </Bar>
          <Bar
            yAxisId="amount"
            dataKey="otherIncome"
            stackId="income"
            fill={SEMANTIC_COLORS.passiveIncome}
            radius={[3, 3, 0, 0]}
          >
            {data.map((point) => (
              <Cell key={point.year} fillOpacity={getIncomeYearOpacity(point)} />
            ))}
          </Bar>
          <Bar
            yAxisId="amount"
            dataKey="placedSavings"
            fill={SEMANTIC_COLORS.netContributions}
            radius={[3, 3, 0, 0]}
          >
            {data.map((point) => (
              <Cell key={point.year} fillOpacity={point.savingsStatus === 'complete' ? 0.9 : 0.4} />
            ))}
          </Bar>
          <Line
            yAxisId="rate"
            type="monotone"
            dataKey="placementRate"
            stroke={SEMANTIC_COLORS.returnRate}
            strokeWidth={2.5}
            connectNulls={false}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-xs text-content-subtle">
        <span className="flex items-center gap-2">
          <i
            className="h-2.5 w-3 rounded-sm"
            style={{ backgroundColor: SEMANTIC_COLORS.costBasis }}
          />
          {i18n.t('ui.annualincomesavingschart.netSalary.970d84')}
        </span>
        <span className="flex items-center gap-2">
          <i
            className="h-2.5 w-3 rounded-sm"
            style={{ backgroundColor: SEMANTIC_COLORS.passiveIncome }}
          />
          {i18n.t('ui.annualincomesavingschart.otherIncome.9eb09b')}
        </span>
        <span className="flex items-center gap-2">
          <i
            className="h-2.5 w-3 rounded-sm"
            style={{ backgroundColor: SEMANTIC_COLORS.netContributions }}
          />
          {i18n.t('ui.annualincomesavingschart.netContributions.643e29')}
        </span>
        <span className="flex items-center gap-2">
          <i className="h-0.5 w-4" style={{ backgroundColor: SEMANTIC_COLORS.returnRate }} />
          {i18n.t('ui.annualincomesavingschart.placementRate.5df16e')}
        </span>
      </div>
    </div>
  )
}
