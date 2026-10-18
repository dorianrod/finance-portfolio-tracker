import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fmtEur, fmtFull, shortMonth } from '@/shared/format/money'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import type { WealthDriverPoint } from './portfolioCharts.logic'

interface DriversTooltipProps {
  active?: boolean
  payload?: Array<{ payload: WealthDriverPoint }>
  label?: string
}

function DriversTooltip({ active, payload, label }: DriversTooltipProps) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as WealthDriverPoint
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
      <div className="mb-2 font-semibold text-white">{label}</div>
      <div className="space-y-1 text-gray-300">
        <div className="flex justify-between gap-6"><span>Net contributions</span><span className="font-medium" style={{ color: SEMANTIC_COLORS.netContributionsText }}>{fmtFull(row.cumulative_savings)}</span></div>
        <div className="flex justify-between gap-6"><span>Market performance</span><span className="font-medium" style={{ color: row.cumulative_performance >= 0 ? SEMANTIC_COLORS.performancePositiveText : SEMANTIC_COLORS.performanceNegativeText }}>{fmtFull(row.cumulative_performance)}</span></div>
        <div className="flex justify-between gap-6 border-t border-gray-700 pt-1"><span>Total change</span><span className="font-semibold text-white">{fmtFull(row.cumulative_change)}</span></div>
      </div>
    </div>
  )
}

export function WealthDriversChart({ data }: { data: WealthDriverPoint[] }) {
  return (
    <div className="rounded-xl bg-gray-900 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-300">Cumulative wealth drivers</h2>
        <p className="mt-0.5 text-xs text-gray-600">How net contributions and market performance built the change over the selected period.</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="driversSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SEMANTIC_COLORS.netContributions} stopOpacity={0.35} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.netContributions} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="driversPerformance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SEMANTIC_COLORS.performance} stopOpacity={0.3} />
              <stop offset="95%" stopColor={SEMANTIC_COLORS.performance} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="date" tickFormatter={shortMonth} tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtEur} tick={{ fill: 'var(--chart-tick)', fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<DriversTooltip />} />
          <Area type="monotone" dataKey="cumulative_savings" stroke={SEMANTIC_COLORS.netContributions} fill="url(#driversSavings)" strokeWidth={2} />
          <Area type="monotone" dataKey="cumulative_performance" stroke={SEMANTIC_COLORS.performance} fill="url(#driversPerformance)" strokeWidth={2} />
          <Line type="monotone" dataKey="cumulative_change" stroke={SEMANTIC_COLORS.totalChange} strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.netContributions }} />Net contributions</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.performance }} />Market performance</span>
        <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.totalChange }} />Total change</span>
      </div>
    </div>
  )
}
