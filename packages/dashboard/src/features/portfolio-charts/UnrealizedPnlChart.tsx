import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PortfolioHistoryPoint } from '@/types/history'
import { fmtEur, fmtFull, fmtPct, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'

interface UnrealizedPnlPoint extends PortfolioHistoryPoint {
  unrealized_gain_pct: number | null
  snapshot_change: number | null
}

interface UnrealizedPnlTooltipProps {
  active?: boolean
  payload?: Array<{ payload: UnrealizedPnlPoint }>
}

function UnrealizedPnlTooltip({ active, payload }: UnrealizedPnlTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  const valueColor = point.unrealized_gain >= 0
    ? SEMANTIC_COLORS.performancePositiveText
    : SEMANTIC_COLORS.performanceNegativeText
  const date = new Date(`${point.date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6, fontWeight: 600 }}>{date}</div>
      <div style={{ color: valueColor, fontWeight: 600 }}>
        Gross unrealized P&amp;L: {fmtFull(point.unrealized_gain)}
      </div>
      <div style={{ color: 'var(--tooltip-label)', marginTop: 4 }}>
        P&amp;L / total capital placed: {point.unrealized_gain_pct == null ? '—' : fmtPct(point.unrealized_gain_pct)}
      </div>
      <div style={{ color: CHART_THEME.label, marginTop: 4 }}>Cost basis: {fmtFull(point.total_cost_basis)}</div>
      {point.snapshot_change != null && (
        <div style={{ borderTop: '1px solid var(--tooltip-border)', color: CHART_THEME.label, marginTop: 6, paddingTop: 6 }}>
          Change since previous snapshot: {fmtFull(point.snapshot_change)}
        </div>
      )}
    </TooltipBox>
  )
}

export function UnrealizedPnlChart({ history }: { history: PortfolioHistoryPoint[] }) {
  const data: UnrealizedPnlPoint[] = history.map((point, index) => ({
    ...point,
    unrealized_gain_pct: point.total_cost_basis > 0
      ? point.unrealized_gain / point.total_cost_basis * 100
      : null,
    snapshot_change: index > 0
      ? point.unrealized_gain - history[index - 1].unrealized_gain
      : null,
  }))

  if (data.length === 0) return null

  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-gray-300">Gross unrealized P&amp;L over time<InfoTooltip text="Amount before estimated tax and percentage of the total cost basis." scope={{ account: 'filterable', period: 'range' }} /></h2>
        <p className="mt-0.5 text-xs text-gray-600">Amount before estimated tax and percentage of the total cost basis.</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="amount" tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <YAxis yAxisId="pct" orientation="right" tickFormatter={(value: number) => `${Math.round(value)}%`} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
          <ReferenceLine yAxisId="amount" y={0} stroke={CHART_THEME.zeroLine} />
          <Tooltip content={<UnrealizedPnlTooltip />} cursor={{ fill: CHART_THEME.cursor }} />
          <Bar yAxisId="amount" dataKey="unrealized_gain" maxBarSize={24} radius={3} isAnimationActive={false}>
            {data.map((point) => (
              <Cell
                key={point.date}
                fill={point.unrealized_gain >= 0 ? SEMANTIC_COLORS.performancePositive : SEMANTIC_COLORS.performanceNegative}
              />
            ))}
          </Bar>
          <Line yAxisId="pct" type="monotone" dataKey="unrealized_gain_pct" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.performancePositive }} />Gross unrealized gain</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.performanceNegative }} />Gross unrealized loss</span>
        <span><i className="mr-1.5 inline-block h-0.5 w-3 align-middle" style={{ backgroundColor: SEMANTIC_COLORS.returnRate }} />P&amp;L / capital placed</span>
      </div>
    </div>
  )
}
