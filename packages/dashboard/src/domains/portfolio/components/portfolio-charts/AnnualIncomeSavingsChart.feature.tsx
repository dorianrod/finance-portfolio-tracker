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
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/helpers/mappers/mapAnnualIncomeSavings'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/components/kpis/ScopedInfoTooltip.feature'
import { getIncomeYearOpacity } from './helpers/presenters/getIncomeYearOpacity'

function IncomeSavingsTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload?: AnnualIncomeSavingsPoint }>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  const suffix = point.incomeStatus === 'forecast' ? ' · forecast' : ''
  const savingsSuffix = point.savingsStatus === 'partial'
    ? ` · YTD through ${point.savingsThrough}`
    : ''
  return (
    <TooltipBox minWidth={235}>
      <div style={{ color: 'var(--tooltip-text)', fontWeight: 600, marginBottom: 7 }}>
        {point.year}{suffix}
      </div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>Net salary: {formatMoney(point.netSalary, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>Other income: {formatMoney(point.otherIncome, { style: 'full' })}</div>
      <div style={{ color: 'var(--tooltip-label)', marginTop: 4 }}>Total net income: {formatMoney(point.totalIncome, { style: 'full' })}</div>
      <div style={{ color: SEMANTIC_COLORS.netContributionsText, marginTop: 7 }}>
        Net contributions: {point.placedSavings == null ? '—' : formatMoney(point.placedSavings, { style: 'full' })}{savingsSuffix}
      </div>
      <div style={{ color: SEMANTIC_COLORS.returnRate, marginTop: 4 }}>
        Placement rate: {point.placementRate == null ? 'Not comparable' : formatPercentage(point.placementRate)}
      </div>
      <div style={{ color: 'var(--tooltip-dim)', marginTop: 7, borderTop: '1px solid var(--tooltip-border)', paddingTop: 7 }}>
        Unplaced income proxy: {point.unplacedIncomeProxy == null ? '—' : formatMoney(point.unplacedIncomeProxy, { style: 'full' })}
      </div>
    </TooltipBox>
  )
}

function IncomeCell({ point }: { point: AnnualIncomeSavingsPoint }) {
  return <Cell fillOpacity={getIncomeYearOpacity(point)} />
}

function SavingsCell({ point }: { point: AnnualIncomeSavingsPoint }) {
  return <Cell fillOpacity={point.savingsStatus === 'complete' ? 0.9 : 0.4} />
}

export function AnnualIncomeSavingsChart({ data }: { data: AnnualIncomeSavingsPoint[] }) {
  const formatMoney = useFormatMoney()
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="mb-3 flex items-start gap-3">
        <div>
          <h2 className="flex items-center text-sm font-medium text-gray-300">Income vs net contributions<ScopedInfoTooltip text="Annual declared income compared with deposits minus withdrawals across all accounts." scope={{ account: 'global', period: 'year-range' }} /></h2>
          <p className="mt-1 text-xs text-gray-500">Annual · All accounts</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={285}>
        <ComposedChart data={data} margin={{ top: 8, right: 48, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="year" tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="amount" tickFormatter={(value) => formatMoney(value, { style: 'compact' })} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
          <YAxis yAxisId="rate" orientation="right" tickFormatter={(value) => `${value}%`} tick={{ fill: CHART_THEME.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
          <Tooltip content={<IncomeSavingsTooltip />} />
          <Bar yAxisId="amount" dataKey="netSalary" stackId="income" fill={SEMANTIC_COLORS.costBasis} radius={[0, 0, 3, 3]}>
            {data.map((point) => <IncomeCell key={point.year} point={point} />)}
          </Bar>
          <Bar yAxisId="amount" dataKey="otherIncome" stackId="income" fill={SEMANTIC_COLORS.passiveIncome} radius={[3, 3, 0, 0]}>
            {data.map((point) => <IncomeCell key={point.year} point={point} />)}
          </Bar>
          <Bar yAxisId="amount" dataKey="placedSavings" fill={SEMANTIC_COLORS.netContributions} radius={[3, 3, 0, 0]}>
            {data.map((point) => <SavingsCell key={point.year} point={point} />)}
          </Bar>
          <Line yAxisId="rate" type="monotone" dataKey="placementRate" stroke={SEMANTIC_COLORS.returnRate} strokeWidth={2.5} connectNulls={false} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-800 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-2"><i className="h-2.5 w-3 rounded-sm" style={{ backgroundColor: SEMANTIC_COLORS.costBasis }} />Net salary</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-3 rounded-sm" style={{ backgroundColor: SEMANTIC_COLORS.passiveIncome }} />Other income</span>
        <span className="flex items-center gap-2"><i className="h-2.5 w-3 rounded-sm" style={{ backgroundColor: SEMANTIC_COLORS.netContributions }} />Net contributions</span>
        <span className="flex items-center gap-2"><i className="h-0.5 w-4" style={{ backgroundColor: SEMANTIC_COLORS.returnRate }} />Placement rate</span>
      </div>
    </div>
  )
}
