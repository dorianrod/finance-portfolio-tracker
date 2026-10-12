import type { AccountTypePoint, PortfolioHistoryPoint } from '@/types/history'
import type { MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { AccountTypeHistoryPoint } from '@/hooks/useAccountTypeHistory'
import type { TrailingSavingCapacityPoint, TrailingYearOverYear, WealthDriverPoint, YearOverYearMetric } from '@/features/portfolio-charts/portfolioCharts.logic'
import { AccountTypeBreakdownChart } from '@/features/portfolio-charts/AccountTypeBreakdownChart'
import { AccountTypeHistoryChart } from '@/features/portfolio-charts/AccountTypeHistoryChart'
import { EvolutionChart } from '@/features/portfolio-charts/EvolutionChart'
import { MonthlySavingsChart } from '@/features/portfolio-charts/MonthlySavingsChart'
import { WealthDriversChart } from '@/features/portfolio-charts/WealthDriversChart'
import { Kpi, KpiCard } from '@/features/kpis/Kpi'
import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'

interface WealthTabProps {
  history: PortfolioHistoryPoint[]
  accountTypeData: AccountTypePoint[]
  accountTypeHistory: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
  savings: TrailingSavingCapacityPoint[]
  monthlyOps: MonthlyOpsMap
  drivers: WealthDriverPoint[]
  trailingYearComparison: TrailingYearOverYear
}

function monthRangeLabel(months: string[]): string {
  const formatter = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  if (months.length === 0) return ''
  const formatMonth = (month: string) => formatter.format(new Date(`${month}-01T00:00:00Z`))
  if (months.length === 1) return formatMonth(months[0])
  return `${formatMonth(months[0])} – ${formatMonth(months[months.length - 1])}`
}

function ComparisonKpi({ label, metric, currentMonths, comparisonMonths, tone }: {
  label: string
  metric: YearOverYearMetric
  currentMonths: string[]
  comparisonMonths: string[]
  tone: 'blue' | 'performance'
}) {
  const valueColor = tone === 'blue'
    ? SEMANTIC_TEXT_CLASSES.netContributions
    : metric.current == null || metric.current >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
  const changeColor = metric.changePct == null
    ? 'text-gray-500'
    : metric.changePct >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
  const currentLabel = monthRangeLabel(currentMonths)
  const comparisonLabel = monthRangeLabel(comparisonMonths)

  return (
    <KpiCard>
      <Kpi
        label={label}
        tooltip="Rolling total over the latest twelve calendar months, compared with the preceding twelve-month window. The latest month may be partial."
        value={metric.current == null ? '—' : fmt.format(metric.current)}
        valueColor={valueColor}
        sub={metric.changePct == null ? '—' : fmtPct(metric.changePct)}
        subColor={changeColor}
        subSmall={currentLabel || 'Insufficient history'}
        subInline
      />
      <div className="mt-3 border-t border-gray-800 pt-3 text-xs text-gray-500">
        Same period last year: <span className="font-medium text-gray-300">{metric.previous == null ? '—' : fmt.format(metric.previous)}</span>
        {comparisonLabel && <span> · {comparisonLabel}</span>}
      </div>
    </KpiCard>
  )
}

export function WealthTab({ history, accountTypeData, accountTypeHistory, accountTypes, typeCategories, savings, monthlyOps, drivers, trailingYearComparison }: WealthTabProps) {
  const labelledTypes = accountTypeData.map((point) => {
    const pct = point.total_cost_basis > 0 ? point.unrealized_gain / point.total_cost_basis * 100 : 0
    return { ...point, _label: `${Math.round(point.total_value).toLocaleString('en-GB')} € ${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%` }
  })
  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ComparisonKpi label="Net contributions · trailing 12m" metric={trailingYearComparison.savings} currentMonths={trailingYearComparison.currentMonths} comparisonMonths={trailingYearComparison.comparisonMonths} tone="blue" />
        <ComparisonKpi label="Market performance · trailing 12m" metric={trailingYearComparison.performance} currentMonths={trailingYearComparison.currentMonths} comparisonMonths={trailingYearComparison.comparisonMonths} tone="performance" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {history.length > 0 && <EvolutionChart history={history} />}
        {labelledTypes.length > 0 && <AccountTypeBreakdownChart data={labelledTypes} />}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MonthlySavingsChart data={savings} ops={monthlyOps} />
        {drivers.length > 0 && <WealthDriversChart data={drivers} />}
      </div>
      {accountTypeHistory.length > 0 && <AccountTypeHistoryChart data={accountTypeHistory} accountTypes={accountTypes} typeCategories={typeCategories} />}
    </div>
  )
}
