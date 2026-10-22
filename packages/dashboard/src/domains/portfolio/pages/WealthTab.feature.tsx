import type { AccountTypePoint, PortfolioHistoryPoint } from '@/domains/portfolio/types/history'
import type { MonthlyOpsMap } from '@/domains/portfolio/apis/queries/useMonthlyOps'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/apis/queries/useAccountTypeHistory'
import type { TrailingSavingCapacityPoint, TrailingYearOverYear, WealthDriverPoint, YearOverYearMetric } from '@/domains/portfolio/components/portfolio-charts/portfolioCharts.logic'
import { AccountTypeBreakdownChart } from '@/domains/portfolio/components/portfolio-charts/AccountTypeBreakdownChart.feature'
import { AccountTypeHistoryChart } from '@/domains/portfolio/components/portfolio-charts/AccountTypeHistoryChart.feature'
import { EvolutionChart } from '@/domains/portfolio/components/portfolio-charts/EvolutionChart.feature'
import { MonthlySavingsChart } from '@/domains/portfolio/components/portfolio-charts/MonthlySavingsChart.feature'
import { WealthDriversChart } from '@/domains/portfolio/components/portfolio-charts/WealthDriversChart.feature'
import { AnnualIncomeSavingsChart } from '@/domains/portfolio/components/portfolio-charts/AnnualIncomeSavingsChart.feature'
import { IncomePlacementRelationshipChart } from '@/domains/portfolio/components/portfolio-charts/IncomePlacementRelationshipChart.feature'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/helpers/annualIncomeSavings.logic'
import { Kpi, KpiCard } from '@/domains/portfolio/components/kpis/Kpi.view'
import { FilterScopeBadges } from '@/domains/portfolio/components/filters/FilterScopeBadges.feature'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

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
  annualIncomeSavings: AnnualIncomeSavingsPoint[]
}

function monthRangeLabel(months: string[], formatDate: ReturnType<typeof useFormatDate>): string {
  if (months.length === 0) return ''
  const formatMonth = (month: string) => formatDate(`${month}-01T00:00:00Z`, { style: 'shortMonthYear', timeZone: 'UTC' })
  if (months.length === 1) return formatMonth(months[0])
  return `${formatMonth(months[0])} – ${formatMonth(months[months.length - 1])}`
}

function performanceColor(value: number | null): string {
  return value == null || value >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}

function ComparisonKpi({ label, metric, currentMonths, tone }: {
  label: string
  metric: YearOverYearMetric
  currentMonths: string[]
  tone: 'blue' | 'performance'
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const valueColor = tone === 'blue'
    ? SEMANTIC_TEXT_CLASSES.netContributions
    : performanceColor(metric.current)
  const changeColor = metric.changePct == null
    ? 'text-gray-500'
    : performanceColor(metric.changePct)
  const currentLabel = monthRangeLabel(currentMonths, formatDate)
  const value = metric.current == null ? '—' : formatMoney(metric.current)
  let accent: 'contributions' | 'positive' | 'negative' = 'positive'
  if (tone === 'blue') accent = 'contributions'
  else if (metric.current != null && metric.current < 0) accent = 'negative'

  return (
    <KpiCard>
      <Kpi.Root accent={accent}>
        <Kpi.Label
          tooltip="Rolling total over the latest twelve calendar months, compared with the preceding twelve-month window. The latest month may be partial."
          tooltipFooter={<FilterScopeBadges account="filterable" period="trailing-12m" />}
        >
          {label}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value color={valueColor} title={value}>{value}</Kpi.Value>
          <Kpi.InlineNote color={changeColor}>{metric.changePct == null ? '—' : formatPercentage(metric.changePct, { signed: true })}</Kpi.InlineNote>
        </Kpi.ValueRow>
        <Kpi.Detail>{currentLabel || 'Insufficient history'}</Kpi.Detail>
        <Kpi.Footer>
          Previous 12m: <span className="font-medium text-gray-300">{metric.previous == null ? '—' : formatMoney(metric.previous)}</span>
        </Kpi.Footer>
      </Kpi.Root>
    </KpiCard>
  )
}

export function WealthTab({ history, accountTypeData, accountTypeHistory, accountTypes, typeCategories, savings, monthlyOps, drivers, trailingYearComparison, annualIncomeSavings }: WealthTabProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const labelledTypes = accountTypeData.map((point) => {
    const pct = point.total_cost_basis > 0 ? point.unrealized_gain / point.total_cost_basis * 100 : 0
    return { ...point, _label: `${formatMoney(point.total_value, { style: 'full' })} ${formatPercentage(pct, { decimals: 0, signed: true })}` }
  })
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-gray-800 pb-4">
        <ComparisonKpi label="Net contributions · trailing 12m" metric={trailingYearComparison.savings} currentMonths={trailingYearComparison.currentMonths} tone="blue" />
        <ComparisonKpi label="Market performance · trailing 12m" metric={trailingYearComparison.performance} currentMonths={trailingYearComparison.currentMonths} tone="performance" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {history.length > 0 && <EvolutionChart history={history} />}
        {/* eslint-disable-next-line local/no-prop-drilling -- Account label enrichment is owned by the wealth orchestration feature. */}
        {labelledTypes.length > 0 && <AccountTypeBreakdownChart data={labelledTypes} />}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MonthlySavingsChart data={savings} ops={monthlyOps} />
        {drivers.length > 0 && <WealthDriversChart data={drivers} />}
      </div>
      {annualIncomeSavings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AnnualIncomeSavingsChart data={annualIncomeSavings} />
          <IncomePlacementRelationshipChart data={annualIncomeSavings} />
        </div>
      )}
      {accountTypeHistory.length > 0 && <AccountTypeHistoryChart data={accountTypeHistory} accountTypes={accountTypes} typeCategories={typeCategories} />}
    </div>
  )
}
