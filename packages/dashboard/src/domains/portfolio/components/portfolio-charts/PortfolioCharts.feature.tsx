import { useMemo } from 'react'
import type { PortfolioHistoryPoint, AccountTypePoint } from '@/domains/portfolio/types/history'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { useMonthlyOps } from '@/domains/portfolio/apis/queries/useMonthlyOps'
import { useSavingCapacity } from '@/domains/portfolio/apis/queries/useSavingCapacity'
import { usePassiveIncome } from '@/domains/portfolio/apis/queries/usePassiveIncome'
import { useAccountTypeHistory } from '@/domains/portfolio/apis/queries/useAccountTypeHistory'
import {
  computeTopPerformers,
  computeTrailing12mSavings,
  filterMonthlyOpsByAccounts,
} from './portfolioCharts.logic'
import { AccountTypeBreakdownChart } from './AccountTypeBreakdownChart.feature'
import { MonthlySavingsChart } from './MonthlySavingsChart.feature'
import { PassiveIncomeChart } from './PassiveIncomeChart.feature'
import { AccountTypeHistoryChart } from './AccountTypeHistoryChart.feature'
import { EvolutionChart } from './EvolutionChart.feature'
import { TriChart } from './TriChart.feature'
import { TopPerformersChart } from './TopPerformersChart.feature'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

interface Props {
  history: PortfolioHistoryPoint[]
  accounts?: Set<string>
  accountTypeData?: AccountTypePoint[]
  positions?: PositionRow[]
  dateFrom?: string
  dateTo?: string
}

export function PortfolioCharts({ history, accounts, accountTypeData, positions, dateFrom, dateTo }: Props) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { data: allOps = new Map() } = useMonthlyOps()
  const ops = filterMonthlyOpsByAccounts(allOps, accounts)

  const { data: savingCapacity = [] } = useSavingCapacity(accounts)
  const last12 = computeTrailing12mSavings(savingCapacity)

  const { data: passiveIncome = [] } = usePassiveIncome(accounts, dateFrom, dateTo)
  const { data: typeHistory, accountTypes, typeCategories } = useAccountTypeHistory(accounts)

  const accountTypeWithLabels = (accountTypeData ?? []).map((point) => {
    const percentage = point.total_cost_basis > 0 ? point.unrealized_gain / point.total_cost_basis * 100 : 0
    return { ...point, _label: `${formatMoney(point.total_value, { style: 'full' })} ${formatPercentage(percentage, { decimals: 0, signed: true })}` }
  })
  const topPerformers = useMemo(() => computeTopPerformers(positions), [positions])
  const topPerformersHeight = Math.max(240, topPerformers.length * 26)

  return (
    <div className="flex flex-col gap-4 mb-6">

      {/* ── Row 1: Breakdown by type + Savings capacity ────────────── */}
      <div className="flex gap-4">
        {/* eslint-disable-next-line local/no-prop-drilling -- This orchestration feature owns chart-ready account labels. */}
        {accountTypeWithLabels.length > 0 && <AccountTypeBreakdownChart data={accountTypeWithLabels} />}
        {/* eslint-disable-next-line local/no-prop-drilling -- This orchestration feature joins monthly data with its matching operations. */}
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

      {/* ── Row 3b: TRI over time ───────────────────────────────────────── */}
      <TriChart history={history} />

      {/* ── Row 4: Performance by position ─────────────────────────────── */}
      {topPerformers.length > 0 && <TopPerformersChart data={topPerformers} height={topPerformersHeight} />}

    </div>
  )
}
