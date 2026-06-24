import { useMemo } from 'react'
import type { PortfolioHistoryPoint, AccountTypePoint } from '@/types/history'
import type { PositionRow } from '@/types/domain'
import { useMonthlyOps } from '@/hooks/useMonthlyOps'
import { useSavingCapacity } from '@/hooks/useSavingCapacity'
import { usePassiveIncome } from '@/hooks/usePassiveIncome'
import { useAccountTypeHistory } from '@/hooks/useAccountTypeHistory'
import {
  computeTopPerformers,
  computeTrailing12mSavings,
  buildAccountTypeLabels,
  filterMonthlyOpsByAccounts,
} from './portfolioCharts.logic'
import { AccountTypeBreakdownChart } from './AccountTypeBreakdownChart'
import { MonthlySavingsChart } from './MonthlySavingsChart'
import { PassiveIncomeChart } from './PassiveIncomeChart'
import { AccountTypeHistoryChart } from './AccountTypeHistoryChart'
import { EvolutionChart } from './EvolutionChart'
import { TopPerformersChart } from './TopPerformersChart'

interface Props {
  history: PortfolioHistoryPoint[]
  accounts?: Set<string>
  accountTypeData?: AccountTypePoint[]
  positions?: PositionRow[]
  dateFrom?: string
  dateTo?: string
}

export function PortfolioCharts({ history, accounts, accountTypeData, positions, dateFrom, dateTo }: Props) {
  const allOps = useMonthlyOps()
  const ops = filterMonthlyOpsByAccounts(allOps, accounts)

  const savingCapacity = useSavingCapacity(accounts)
  const last12 = computeTrailing12mSavings(savingCapacity)

  const passiveIncome = usePassiveIncome(accounts, dateFrom, dateTo)
  const { data: typeHistory, accountTypes, typeCategories } = useAccountTypeHistory(accounts)

  const accountTypeWithLabels = buildAccountTypeLabels(accountTypeData)
  const topPerformers = useMemo(() => computeTopPerformers(positions), [positions])
  const topPerformersHeight = Math.max(240, topPerformers.length * 26)

  return (
    <div className="flex flex-col gap-4 mb-6">

      {/* ── Row 1: Breakdown by type + Savings capacity ────────────── */}
      <div className="flex gap-4">
        {accountTypeWithLabels.length > 0 && <AccountTypeBreakdownChart data={accountTypeWithLabels} />}
        <MonthlySavingsChart data={last12} ops={ops} />
      </div>

      {/* ── Row 2: Passive income + Account type over time ─────────────────── */}
      <div className="flex gap-4">
        {passiveIncome.length > 0 && <PassiveIncomeChart data={passiveIncome} />}
        {typeHistory.length > 0 && (
          <AccountTypeHistoryChart data={typeHistory} accountTypes={accountTypes} typeCategories={typeCategories} />
        )}
      </div>

      {/* ── Row 3: Portfolio value over time ────────────────────────────── */}
      <EvolutionChart history={history} />

      {/* ── Row 4: Performance by position ─────────────────────────────── */}
      {topPerformers.length > 0 && <TopPerformersChart data={topPerformers} height={topPerformersHeight} />}

    </div>
  )
}
