import { AccountTypeBreakdownChart } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature'
import { AccountTypeHistoryChart } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart.feature'
import { AnnualIncomeSavingsChart } from '@/domains/portfolio/features/wealth/components/AnnualIncomeSavingsChart.feature'
import { EvolutionChart } from '@/domains/portfolio/features/wealth/components/EvolutionChart.feature'
import { IncomePlacementRelationshipChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/IncomePlacementRelationshipChart.feature'
import { MonthlySavingsChart } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart.feature'
import { WealthComparisonKpi } from '@/domains/portfolio/features/wealth/components/WealthComparisonKpi.view'
import { WealthDriversChart } from '@/domains/portfolio/features/wealth/components/WealthDriversChart.feature'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'
import type {
  TrailingSavingCapacityPoint,
  TrailingYearOverYear,
  WealthDriverPoint,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import type { AccountTypePoint } from '@/domains/portfolio/shared/types/accountTypePoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'

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
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-b border-border pb-4">
        <WealthComparisonKpi
          label={i18n.t('ui.wealthtab.netContributionsTrailing12m')}
          metric={trailingYearComparison.savings}
          currentMonths={trailingYearComparison.currentMonths}
          tone="blue"
        >
          <FilterScopeBadges account="filterable" period="trailing-12m" />
        </WealthComparisonKpi>
        <WealthComparisonKpi
          label={i18n.t('ui.wealthtab.marketPerformanceTrailing12m')}
          metric={trailingYearComparison.performance}
          currentMonths={trailingYearComparison.currentMonths}
          tone="performance"
        >
          <FilterScopeBadges account="filterable" period="trailing-12m" />
        </WealthComparisonKpi>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {history.length > 0 && <EvolutionChart history={history} />}
        {accountTypeData.length > 0 && (
          <AccountTypeBreakdownChart data={accountTypeData} />
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
