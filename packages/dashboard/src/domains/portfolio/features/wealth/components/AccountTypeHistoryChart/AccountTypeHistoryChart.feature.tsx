import { type ReactNode, useMemo } from 'react'

import type {
  AccountTypeHistory,
  AccountTypeHistoryPoint,
} from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'

import { AccountTypeHistoryChartView } from './AccountTypeHistoryChart.view'
import { withAccountTypeShares } from './helpers/presenters/withAccountTypeShares'
import { withAccountTypeHistoryTotals } from './helpers/transformers/withAccountTypeHistoryTotals'

/*
 * @architecture-decision prepared-account-type-history
 * @rules arch-component-roles, helpers-categories
 * @choice Aggregate each selected account snapshot before preparing its visual series.
 * @reason The chart and tooltip share a supplied-data contract; tooltip rendering must not aggregate domain collections.
 * @alternative Preparing these totals in WealthTab moves chart-specific scope coordination into the page.
 * @revisit Account selection or reporting totals acquire a lifecycle independent of this chart.
 */
export function AccountTypeHistoryChart({
  data,
  children,
  accountTypes,
  typeCategories,
}: {
  data: AccountTypeHistoryPoint[]
  children: ReactNode
  accountTypes: string[]
  typeCategories: AccountTypeHistory['typeCategories']
}) {
  const chartData = useMemo(
    () =>
      withAccountTypeShares(
        withAccountTypeHistoryTotals(data, accountTypes),
        accountTypes,
      ),
    [data, accountTypes],
  )
  return (
    <AccountTypeHistoryChartView
      data={chartData}
      accountTypes={accountTypes}
      typeCategories={typeCategories}
    >
      {children}
    </AccountTypeHistoryChartView>
  )
}
