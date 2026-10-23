import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/helpers/mappers/mapAnnualIncomeSavings'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import type { YearLabelPlacement } from './helpers/calculators/calculateYearLabelLayout'
import { useIncomePlacementChart } from './services/useIncomePlacementChart'

const DEFAULT_YEAR_LABEL_PLACEMENT: YearLabelPlacement = { dx: 0, dy: -12, textAnchor: 'middle' }

function RelationshipCell({ newestYear, oldestYear, point, recentYears }: { newestYear: number; oldestYear: number; point: AnnualIncomeSavingsPoint; recentYears: Set<number> }) {
  const isRecent = recentYears.has(point.year)
  const ageProgress = (point.year - oldestYear) / Math.max(1, newestYear - oldestYear)
  return <Cell fill={isRecent ? SEMANTIC_COLORS.returnRate : SEMANTIC_COLORS.neutralSeries} fillOpacity={isRecent ? 1 : 0.3 + ageProgress * 0.35} />
}

function YearLabel({
  index,
  value,
  viewBox,
  placements,
  chartPoints,
  recentYears,
  oldestYear,
  newestYear,
}: LabelProps & {
  placements: YearLabelPlacement[]
  chartPoints: AnnualIncomeSavingsPoint[]
  recentYears: Set<number>
  oldestYear: number
  newestYear: number
}) {
  if (index == null || !viewBox || !('x' in viewBox) || !('y' in viewBox)) return null
  const placement = placements[index] ?? DEFAULT_YEAR_LABEL_PLACEMENT
  const point = chartPoints[index]
  if (!point) return null

  const width = 'width' in viewBox ? Number(viewBox.width ?? 0) : 0
  const height = 'height' in viewBox ? Number(viewBox.height ?? 0) : 0
  const x = Number(viewBox.x) + width / 2 + placement.dx
  const y = Number(viewBox.y) + height / 2 + placement.dy
  const isRecent = recentYears.has(point.year)
  const ageProgress = (point.year - oldestYear) / Math.max(1, newestYear - oldestYear)
  const opacity = isRecent ? 1 : 0.3 + ageProgress * 0.35

  return (
    <text
      x={x}
      y={y}
      textAnchor={placement.textAnchor}
      fill={isRecent ? SEMANTIC_COLORS.returnRate : SEMANTIC_COLORS.neutralSeries}
      fillOpacity={opacity}
      fontSize={11}
      fontWeight={isRecent ? 600 : 400}
      pointerEvents="none"
    >
      {value}
    </text>
  )
}

function RelationshipTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload?: AnnualIncomeSavingsPoint }>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <TooltipBox minWidth={220}>
      <div style={{ color: 'var(--tooltip-text)', fontWeight: 600, marginBottom: 7 }}>{point.year}</div>
      <div style={{ color: 'var(--tooltip-label)' }}>Total net income: {formatMoney(point.totalIncome, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>Net salary: {formatMoney(point.netSalary, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>Other income: {formatMoney(point.otherIncome, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.netContributionsText, marginTop: 6 }}>Net contributions: {formatMoney(point.placedSavings ?? 0, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.returnRate }}>Placement rate: {formatPercentage(point.placementRate ?? 0)}</div>
      <div style={{ color: 'var(--tooltip-dim)', marginTop: 6 }}>Unplaced income proxy: {formatMoney(point.unplacedIncomeProxy ?? 0, { style: 'full' })}</div>
    </TooltipBox>
  )
}

export function IncomePlacementRelationshipChart({ data }: { data: AnnualIncomeSavingsPoint[] }) {
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const {
    analysis,
    labelPlacements,
    newestYear,
    oldestYear,
    recentYears,
    setChartWidth,
  } = useIncomePlacementChart(data)
  const [trendStart, trendEnd] = analysis.trendLine
  const trendLine = trendStart && trendEnd ? { end: trendEnd, start: trendStart } : null
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-3">
        <h2 className="flex items-center text-sm font-medium text-gray-300">Income level vs placement rate<ScopedInfoTooltip text="Relationship between annual declared income and the share placed into the portfolio, using comparable actual years." scope={{ account: 'global', period: 'year-range' }} /></h2>
        <p className="mt-1 text-xs text-gray-500">Comparable actual years only · All accounts · Latest 3 years highlighted</p>
      </div>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="text-gray-500">Correlation <strong className="font-semibold text-gray-300">{analysis.correlation == null ? '—' : formatNumber(analysis.correlation, { maximumFractionDigits: 2, minimumFractionDigits: 2, signDisplay: 'always' })}</strong></span>
        <span className="text-gray-500">Trend per €10k income <strong className="font-semibold text-gray-300">{analysis.slopePerTenThousand == null ? '—' : formatPercentage(analysis.slopePerTenThousand, { signed: true, unit: ' pp' })}</strong></span>
      </div>
      <ResponsiveContainer width="100%" height={285} onResize={(width) => setChartWidth(width)}>
        <ScatterChart margin={{ top: 18, right: 24, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis type="number" dataKey="totalIncome" name="Net income" tickFormatter={(value) => formatMoney(value, { style: 'compact' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey="placementRate" name="Placement rate" tickFormatter={(value) => `${value}%`} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<RelationshipTooltip />} />
          {trendLine && (
            <ReferenceLine
              segment={[
                { x: trendLine.start.totalIncome, y: trendLine.start.placementRate },
                { x: trendLine.end.totalIncome, y: trendLine.end.placementRate },
              ]}
              stroke={SEMANTIC_COLORS.neutralSeries}
              strokeDasharray="5 4"
              strokeWidth={2}
            />
          )}
          <Scatter data={analysis.points} fill={SEMANTIC_COLORS.returnRate}>
            {analysis.points.map((point) => <RelationshipCell key={point.year} newestYear={newestYear} oldestYear={oldestYear} point={point} recentYears={recentYears} />)}
            <LabelList
              dataKey="year"
              content={(props) => (
                <YearLabel
                  {...props}
                  placements={labelPlacements}
                  chartPoints={analysis.points}
                  recentYears={recentYears}
                  oldestYear={oldestYear}
                  newestYear={newestYear}
                />
              )}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="mt-3 border-t border-gray-800 pt-3 text-xs leading-relaxed text-gray-500">
        The unplaced amount is income minus observed net contributions: it is a proxy, not measured spending. Other income comes only from salaries.csv; internal reallocations such as private equity are not income. Correlation and trend are descriptive, not causal.
      </p>
    </div>
  )
}
