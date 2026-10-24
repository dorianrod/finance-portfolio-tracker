import { AccountTypeBreakdownChart } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart.feature'
import { AccountTypeHistoryChart } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart.feature'
import { AnnualIncomeSavingsChart } from '@/domains/portfolio/features/wealth/components/AnnualIncomeSavingsChart.feature'
import { EvolutionChart } from '@/domains/portfolio/features/wealth/components/EvolutionChart.feature'
import { IncomePlacementRelationshipChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart.feature'
import { MonthlySavingsChart } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart.feature'
import { WealthDriversChart } from '@/domains/portfolio/features/wealth/components/WealthDriversChart.feature'
import { formatMonthRange } from '@/domains/portfolio/features/wealth/helpers/formatters/formatMonthRange'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import {
  Kpi,
  KpiCard,
} from '@/domains/portfolio/shared/components/kpis/Kpi.view'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'
import type {
  TrailingSavingCapacityPoint,
  TrailingYearOverYear,
  WealthDriverPoint,
  YearOverYearMetric,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import { getPerformanceColor } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceColor'
import type { AccountTypePoint } from '@/domains/portfolio/shared/types/accountTypePoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

type WealthTabProps = {
  history: PortfolioHistoryPoint[]
  accountTypeData: AccountTypePoint[]
  accountTypeHistory: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: Record<string, string>
  savings: TrailingSavingCapacityPoint[]
  monthlyOps: MonthlyOperationsByMonth
  drivers: WealthDriverPoint[]
  trailingYearComparison: TrailingYearOverYear
  annualIncomeSavings: AnnualIncomeSavingsPoint[]
}

function ComparisonKpi({
  label,
  metric,
  currentMonths,
  tone,
}: {
  label: string
  metric: YearOverYearMetric
  currentMonths: string[]
  tone: 'blue' | 'performance'
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const valueColor =
    tone === 'blue'
      ? SEMANTIC_TEXT_CLASSES.netContributions
      : getPerformanceColor(metric.current)
  const changeColor =
    metric.changePct == null
      ? 'text-content-subtle'
      : getPerformanceColor(metric.changePct)
  const currentLabel = formatMonthRange(currentMonths, formatDate)
  const value = metric.current == null ? '—' : formatMoney(metric.current)
  let accent: 'contributions' | 'positive' | 'negative' = 'positive'
  if (tone === 'blue') accent = 'contributions'
  else if (metric.current != null && metric.current < 0) accent = 'negative'

  return (
    <KpiCard>
      <Kpi.Root accent={accent}>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.wealthtab.rollingTotalOverTheLatestTwelveCalendarMonthsCompared',
          )}
        >
          <Kpi.TooltipFooter>
            <FilterScopeBadges account="filterable" period="trailing-12m" />
          </Kpi.TooltipFooter>
          {label}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value color={valueColor} title={value}>
            {value}
          </Kpi.Value>
          <Kpi.InlineNote color={changeColor}>
            {metric.changePct == null
              ? '—'
              : formatPercentage(metric.changePct, { signed: true })}
          </Kpi.InlineNote>
        </Kpi.ValueRow>
        <Kpi.Detail>
          {currentLabel || i18n.t('ui.wealthtab.insufficientHistory')}
        </Kpi.Detail>
        <Kpi.Footer>
          {i18n.t('ui.wealthtab.previous12m')}{' '}
          <span className="font-medium text-content-secondary">
            {metric.previous == null ? '—' : formatMoney(metric.previous)}
          </span>
        </Kpi.Footer>
      </Kpi.Root>
    </KpiCard>
  )
}

export function WealthTab({
  history,
  accountTypeData,
  accountTypeHistory,
  accountTypes,
  typeCategories,
  savings,
  monthlyOps,
  drivers,
  trailingYearComparison,
  annualIncomeSavings,
}: WealthTabProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const labelledTypes = accountTypeData.map((point) => {
    const pct =
      point.total_cost_basis > 0
        ? (point.unrealized_gain / point.total_cost_basis) * 100
        : 0
    return {
      ...point,
      _label: `${formatMoney(point.total_value, { style: 'full' })} ${formatPercentage(pct, { decimals: 0, signed: true })}`,
    }
  })
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-border pb-4">
        <ComparisonKpi
          label={i18n.t('ui.wealthtab.netContributionsTrailing12m')}
          metric={trailingYearComparison.savings}
          currentMonths={trailingYearComparison.currentMonths}
          tone="blue"
        />
        <ComparisonKpi
          label={i18n.t('ui.wealthtab.marketPerformanceTrailing12m')}
          metric={trailingYearComparison.performance}
          currentMonths={trailingYearComparison.currentMonths}
          tone="performance"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {history.length > 0 && <EvolutionChart history={history} />}
        {}
        {labelledTypes.length > 0 && (
          <AccountTypeBreakdownChart data={labelledTypes} />
        )}
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
      {accountTypeHistory.length > 0 && (
        <AccountTypeHistoryChart
          data={accountTypeHistory}
          accountTypes={accountTypes}
          typeCategories={typeCategories}
        />
      )}
    </div>
  )
}
