import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtFull } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import type { HoldingConcentration } from './portfolioCharts.logic'

interface ConcentrationTooltipProps {
  active?: boolean
  payload?: Array<{ payload: HoldingConcentration }>
}

function ConcentrationTooltip({ active, payload }: ConcentrationTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as HoldingConcentration
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white">{row.name}</div>
      <div className="mt-1 text-gray-300">{fmtFull(row.value)} · {row.weight.toFixed(1)}%</div>
    </div>
  )
}

export function ConcentrationChart({ data }: { data: HoldingConcentration[] }) {
  const height = Math.max(250, data.length * 30)
  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-300">Largest holdings</h2>
        <p className="mt-0.5 text-xs text-gray-600">Aggregated across accounts by ISIN or ticker.</p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 50, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" domain={[0, 'dataMax']} hide />
          <YAxis dataKey="label" type="category" tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} tickLine={false} axisLine={false} width={92} />
          <Tooltip content={<ConcentrationTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
          <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => <Cell key={index} fill={index === 0 ? SEMANTIC_COLORS.risk : SEMANTIC_COLORS.neutralSeries} />)}
            <LabelList dataKey="weight" position="right" formatter={(value: unknown) => `${Number(value).toFixed(1)}%`} style={{ fill: 'var(--chart-label)', fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
