import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { fmtEur } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { PassiveIncomeTooltip } from './portfolioCharts.tooltips'
import type { PassiveIncomePoint } from '@/hooks/usePassiveIncome'

export function PassiveIncomeChart({ data }: { data: PassiveIncomePoint[] }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-3">Passive income per year</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="year" tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<PassiveIncomeTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
          <Legend formatter={(value) => (
            <span style={{ color: 'var(--chart-tick)', fontSize: 12 }}>
              {value === 'dividends' ? 'Dividends' : 'Interest'}
            </span>
          )} />
          <Bar dataKey="dividends" stackId="a" fill={SEMANTIC_COLORS.passiveIncome} radius={[0, 0, 0, 0]}>
            <LabelList dataKey="dividends" position="inside" formatter={(v: unknown) => fmtEur(v as number)} style={{ fill: 'var(--tooltip-label)', fontSize: 10 }} />
          </Bar>
          <Bar dataKey="interest" stackId="a" fill={SEMANTIC_COLORS.passiveIncomeSecondary} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
