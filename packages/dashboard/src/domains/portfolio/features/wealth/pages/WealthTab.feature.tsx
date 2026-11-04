import { AccountTypeBreakdownChart } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeBreakdownChart.feature'
import { AccountTypeHistoryChart } from '@/domains/portfolio/features/wealth/components/AccountTypeHistoryChart/AccountTypeHistoryChart.feature'
import { AnnualIncomeSavingsChart } from '@/domains/portfolio/features/wealth/components/AnnualIncomeSavingsChart.view'
import { EvolutionChart } from '@/domains/portfolio/features/wealth/components/EvolutionChart/EvolutionChart.feature'
import { IncomePlacementRelationshipChart } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/IncomePlacementRelationshipChart.feature'
import { MonthlySavingsChart } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart/MonthlySavingsChart.feature'
import { WealthComparisonKpi } from '@/domains/portfolio/features/wealth/components/WealthComparisonKpi.view'
import { WealthDriversChart } from '@/domains/portfolio/features/wealth/components/WealthDriversChart.view'
import { useWealthModel } from '@/domains/portfolio/features/wealth/services/useWealthModel'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Surface } from '@/shared/ui/Surface.view'

export function WealthTab() {
  useGetPortfolioSourcesQuery()
  const {
    displayedHistory: history,
    accountTypeData,
    displayedTypeHistory: accountTypeHistory,
    typeHistory: { accountTypes, typeCategories },
    trailingSavings: savings,
    monthlyOps,
    wealthDrivers: drivers,
    trailingYearComparison,
    displayedAnnualIncomeSavings: annualIncomeSavings,
  } = useWealthModel()
  return (
    <div className="mb-6 space-y-4">
      <Surface variant="sectionEnd">
        <Inline as="div" flow="wrap" align="stretch" gap="relaxed">
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
