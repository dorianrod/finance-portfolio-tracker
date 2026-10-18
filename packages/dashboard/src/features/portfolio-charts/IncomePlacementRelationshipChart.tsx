import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  analyseIncomePlacement,
  type AnnualIncomeSavingsPoint,
} from '@/logic/annualIncomeSavings.logic'
import { fmtEur, fmtFull } from '@/shared/format/money'
import { CHART_THEME } from '@/shared/format/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'

function RelationshipTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload?: AnnualIncomeSavingsPoint }>
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <TooltipBox minWidth={220}>
      <div style={{ color: 'var(--tooltip-text)', fontWeight: 600, marginBottom: 7 }}>{point.year}</div>
      <div style={{ color: 'var(--tooltip-label)' }}>Total net income: {fmtFull(point.totalIncome)}</div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>Net salary: {fmtFull(point.netSalary)}</div>
      <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>Other income: {fmtFull(point.otherIncome)}</div>
      <div style={{ color: SEMANTIC_COLORS.netContributionsText, marginTop: 6 }}>Net contributions: {fmtFull(point.placedSavings ?? 0)}</div>
      <div style={{ color: SEMANTIC_COLORS.returnRate }}>Placement rate: {point.placementRate?.toFixed(1)}%</div>
      <div style={{ color: 'var(--tooltip-dim)', marginTop: 6 }}>Unplaced income proxy: {fmtFull(point.unplacedIncomeProxy ?? 0)}</div>
    </TooltipBox>
  )
}

function signed(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}`
}

export function IncomePlacementRelationshipChart({ data }: { data: AnnualIncomeSavingsPoint[] }) {
  const analysis = analyseIncomePlacement(data)
  const [trendStart, trendEnd] = analysis.trendLine
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-300">Income level vs placement rate</h2>
        <p className="mt-1 text-xs text-gray-500">Comparable actual years only · All accounts</p>
      </div>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="text-gray-500">Correlation <strong className="font-semibold text-gray-300">{analysis.correlation == null ? '—' : signed(analysis.correlation)}</strong></span>
        <span className="text-gray-500">Trend per €10k income <strong className="font-semibold text-gray-300">{analysis.slopePerTenThousand == null ? '—' : `${signed(analysis.slopePerTenThousand, 1)} pp`}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={285}>
        <ScatterChart margin={{ top: 18, right: 24, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis type="number" dataKey="totalIncome" name="Net income" tickFormatter={fmtEur} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey="placementRate" name="Placement rate" unit="%" tickFormatter={(value) => `${value}%`} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<RelationshipTooltip />} />
          {trendStart && trendEnd && (
            <ReferenceLine
              segment={[
                { x: trendStart.totalIncome, y: trendStart.placementRate },
                { x: trendEnd.totalIncome, y: trendEnd.placementRate },
              ]}
              stroke={SEMANTIC_COLORS.neutralSeries}
              strokeDasharray="5 4"
              strokeWidth={2}
            />
          )}
          <Scatter data={analysis.points} fill={SEMANTIC_COLORS.returnRate} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-3 border-t border-gray-800 pt-3 text-xs leading-relaxed text-gray-500">
        The unplaced amount is income minus observed net contributions: it is a proxy, not measured spending. Other income comes only from salaries.csv; internal reallocations such as private equity are not income. Correlation and trend are descriptive, not causal.
      </p>
    </div>
  )
}
