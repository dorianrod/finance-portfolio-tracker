import type { CashHistoryPoint } from '@/domains/portfolio/apis/queries/useCashHistory'
import { accountLabel } from '@/domains/portfolio/components/filters/filterBar.logic'
import { accountFilterId } from '@/domains/portfolio/helpers/filters/accountFilter'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/types/history'

interface BuildDashboardSourceDataInput {
  accountLabels: Record<string, string>
  cashHistory: CashHistoryPoint[]
  history: PortfolioHistoryPoint[]
  positions: PositionRow[]
}

export function buildDashboardSourceData({
  accountLabels,
  cashHistory,
  history,
  positions,
}: BuildDashboardSourceDataInput) {
  const cashByDate = new Map(
    cashHistory.map((cash) => [cash.date, cash.total_broker_cash]),
  )
  const enrichedHistory = history.map((point) => ({
    ...point,
    total_broker_cash: cashByDate.get(point.date) ?? 0,
  }))
  const allAccountTypes = [
    ...new Set(
      positions
        .map((position) => position.account_type)
        .filter((type): type is string => !!type),
    ),
  ].sort()
  const accountToType: Record<string, string> = {}
  const resolvedAccountLabels = { ...accountLabels }

  for (const position of positions) {
    const id = accountFilterId(position)
    if (position.account_type) accountToType[id] = position.account_type
    if (!resolvedAccountLabels[id]) {
      resolvedAccountLabels[id] = id === position.account
        ? accountLabel(position.account, accountLabels)
        : position.name
    }
  }

  return {
    accountFilterLabels: resolvedAccountLabels,
    accountToType,
    allAccounts: [...new Set(positions.map(accountFilterId))].sort(),
    allAccountTypes,
    allOperationTypes: [
      ...new Set(positions.flatMap((position) => [...position.operationTypes])),
    ].sort(),
    enrichedHistory,
  }
}
