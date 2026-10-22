import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { TopPerformersTooltip } from './portfolioCharts.tooltips.view'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import type { TopPerformer } from './portfolioCharts.logic'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function TopPerformersChart({ data, height }: { data: TopPerformer[]; height: number }) {
  const formatPercentage = useFormatPercentage()
  return <div className="bg-gray-900 rounded-xl p-4">
    <h2 className="mb-3 flex items-center text-sm font-medium text-gray-400">Performance by asset<ScopedInfoTooltip text="Gross unrealized performance by currently held asset." scope={{ account: 'filterable', period: 'as-of' }} /></h2>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 64, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => formatPercentage(value, { decimals: 0, signed: true })}
          tick={{ fill: CHART_THEME.tick, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis type="category" dataKey="label" tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={170} />
        <Tooltip content={<TopPerformersTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
        <ReferenceLine x={0} stroke={CHART_THEME.zeroLine} />
        <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pct >= 0 ? SEMANTIC_COLORS.performancePositive : SEMANTIC_COLORS.performanceNegative} />
          ))}
          <LabelList
            dataKey="pct"
            position="right"
            formatter={(value: unknown) => formatPercentage(value as number, { decimals: 0, signed: true })}
            style={{ fill: CHART_THEME.tick, fontSize: 10 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}
