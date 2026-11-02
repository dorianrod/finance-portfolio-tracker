import { AccountTypeBreakdownChart } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature'
import { AccountTypeHistoryChart } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryChart.feature'
import { AnnualIncomeSavingsChart } from '@/domains/portfolio/features/wealth/components/AnnualIncomeSavingsChart.view'
import { EvolutionChart } from '@/domains/portfolio/features/wealth/components/EvolutionChart/EvolutionChart.feature'
import { IncomePlacementRelationshipChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/IncomePlacementRelationshipChart.feature'
import { MonthlySavingsChart } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart/MonthlySavingsChart.feature'
import { WealthComparisonKpi } from '@/domains/portfolio/features/wealth/components/WealthComparisonKpi.view'
import { WealthDriversChart } from '@/domains/portfolio/features/wealth/components/WealthDriversChart.view'
import type { AccountTypeHistory } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/types/trailingSavingCapacityPoint.type'
import type { TrailingYearOverYear } from '@/domains/portfolio/features/wealth/types/trailingYearOverYear.type'
import type { WealthDriverPoint } from '@/domains/portfolio/features/wealth/types/wealthDriverPoint.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Surface } from '@/shared/ui/Surface.view'

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
      <Surface variant="sectionEnd">
        <Inline
          as="div"
          flow="wrap"
          align="start"
          gap="relaxed"
          inset="default"
        >
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
        </Inline>
      </Surface>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {history.length > 0 && (
          <EvolutionChart history={history}>
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.evolutionchart.portfolioMarketValueOverTimeSplitBetweenCostBasis',
              )}
              scope={{ account: 'filterable', period: 'range' }}
            />
          </EvolutionChart>
        )}
        {accountTypeData.length > 0 && (
          <AccountTypeBreakdownChart data={accountTypeData}>
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.accounttypebreakdownchart.eachSliceIsAnAccountTypeTheRadialSplit',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </AccountTypeBreakdownChart>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MonthlySavingsChart data={savings} ops={monthlyOps}>
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.monthlysavingschart.monthlyNetContributionsAndMarketPerformanceWithARolling',
            )}
            scope={{
              account: 'filterable',
              period: 'range-or-trailing-12m',
            }}
          />
        </MonthlySavingsChart>
        {drivers.length > 0 && (
          <WealthDriversChart data={drivers}>
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.wealthdriverschart.howNetContributionsAndMarketPerformanceBuiltTheChange',
              )}
              scope={{ account: 'filterable', period: 'range' }}
            />
          </WealthDriversChart>
        )}
      </div>
      {annualIncomeSavings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AnnualIncomeSavingsChart data={annualIncomeSavings}>
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.annualincomesavingschart.annualDeclaredIncomeComparedWithDepositsMinusWithdrawalsAcross',
              )}
              scope={{ account: 'global', period: 'year-range' }}
            />
          </AnnualIncomeSavingsChart>
          <IncomePlacementRelationshipChart data={annualIncomeSavings} />
        </div>
      )}
      {accountTypeHistory.length > 0 && (
        <AccountTypeHistoryChart
          data={accountTypeHistory}
          accountTypes={accountTypes}
          typeCategories={typeCategories}
        >
          <ScopedInfoTooltip
            text={i18n.t(
              'ui.accounttypehistorychart.evolutionOfPortfolioValueByAccountTypeShownAs',
            )}
            scope={{ account: 'filterable', period: 'range' }}
          />
        </AccountTypeHistoryChart>
      )}
    </div>
  )
}

type WealthTabProps = {
  history: PortfolioHistoryPoint[]
  accountTypeData: AccountTypePoint[]
  accountTypeHistory: AccountTypeHistoryPoint[]
  accountTypes: string[]
  typeCategories: AccountTypeHistory['typeCategories']
  savings: TrailingSavingCapacityPoint[]
  monthlyOps: MonthlyOperationsByMonth
  drivers: WealthDriverPoint[]
  trailingYearComparison: TrailingYearOverYear
  annualIncomeSavings: AnnualIncomeSavingsPoint[]
}
