import { ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { fmtEur, shortMonth } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { MonthlyTooltip } from './portfolioCharts.tooltips'
import type { MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { TrailingSavingCapacityPoint } from './portfolioCharts.logic'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'

export function MonthlySavingsChart({ data, ops }: { data: TrailingSavingCapacityPoint[]; ops: MonthlyOpsMap }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-xl p-4">
      <h2 className="mb-3 flex items-center text-sm font-medium text-gray-400">Monthly wealth drivers<InfoTooltip text="Monthly net contributions and market performance, with a rolling view of saving capacity." scope={{ account: 'filterable', period: 'range-or-trailing-12m' }} /></h2>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 52, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={(props) => <MonthlyTooltip {...props} ops={ops} />} />
          <ReferenceLine yAxisId="left" y={0} stroke={CHART_THEME.zeroLine} />
          <Bar yAxisId="left" dataKey="savings_delta" fill={SEMANTIC_COLORS.netContributions} radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="perf_delta" fill={SEMANTIC_COLORS.performancePositive} radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={(entry.perf_delta ?? 0) >= 0 ? SEMANTIC_COLORS.performancePositive : SEMANTIC_COLORS.performanceNegative} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="rolling_12m" stroke={SEMANTIC_COLORS.netContributions} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: SEMANTIC_COLORS.netContributions }} />
          <Line yAxisId="right" type="monotone" dataKey="rolling_perf_12m" stroke={SEMANTIC_COLORS.performance} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: SEMANTIC_COLORS.performance }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-5 border-t border-gray-800 pt-3 text-xs text-gray-500">
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Monthly bars</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-3 rounded-sm" style={{ backgroundColor: SEMANTIC_COLORS.netContributions }} aria-hidden="true" />
              <span>Net contributions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-3 overflow-hidden rounded-sm" aria-hidden="true">
                <i className="h-full w-1/2" style={{ backgroundColor: SEMANTIC_COLORS.performancePositive }} />
                <i className="h-full w-1/2" style={{ backgroundColor: SEMANTIC_COLORS.performanceNegative }} />
              </span>
              <span>Market performance</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Trailing 12m lines</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4" style={{ backgroundColor: SEMANTIC_COLORS.netContributions }} aria-hidden="true" />
              <span>Net contributions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4" style={{ backgroundColor: SEMANTIC_COLORS.performance }} aria-hidden="true" />
              <span>Market performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
