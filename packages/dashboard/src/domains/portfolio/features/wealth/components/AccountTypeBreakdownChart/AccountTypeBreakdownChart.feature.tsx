import { type ReactNode, useMemo } from 'react'

import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

import { AccountTypeBreakdownChartView } from './AccountTypeBreakdownChart.view'
import { sumAccountTypeValues } from './helpers/transformers/sumAccountTypeValues'

/*
 * @architecture-decision prepared-account-type-breakdown
 * @rules arch-component-roles, helpers-categories
 * @choice Sum the raw portfolio here and give the chart view its reporting denominator.
 * @reason Slice geometry may clamp negative balances; the tooltip share still needs the complete raw portfolio total.
 * @alternative Preparing the denominator in WealthTab couples that page to this chart's tooltip contract.
 * @revisit The chart needs a different reporting scope or another source of prepared totals.
 */
export function AccountTypeBreakdownChart({
  data,
  children,
}: {
  data: AccountTypePoint[]
  children: ReactNode
}) {
  const portfolioTotal = useMemo(() => sumAccountTypeValues(data), [data])
  return (
    <AccountTypeBreakdownChartView data={data} portfolioTotal={portfolioTotal}>
      {children}
    </AccountTypeBreakdownChartView>
  )
}
