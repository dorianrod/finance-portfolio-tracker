import i18n from '@/i18n/i18n'
import { accountFilterId } from '@/domains/portfolio/helpers/filters/accountFilter'

import type { PositionRow } from '@/domains/portfolio/types/domain'
import type { Filters } from '@/domains/portfolio/types/filters'

export function accountLabel(account: string, labels: Record<string, string>): string {
  if (labels[account]) return labels[account]
  return account.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildAccountFilterLabels(
  positions: PositionRow[],
  labels: Record<string, string>,
): Record<string, string> {
  const resolvedLabels = { ...labels }
  for (const position of positions) {
    const id = accountFilterId(position)
    if (!resolvedLabels[id]) {
      resolvedLabels[id] = id === position.account
        ? accountLabel(position.account, labels)
        : position.name
    }
  }
  return resolvedLabels
}

export function buildPortfolioFilterOptions(
  positions: PositionRow[],
  accountLabels: Record<string, string>,
) {
  const accountToType: Record<string, string> = {}
  for (const position of positions) {
    const id = accountFilterId(position)
    if (position.account_type) accountToType[id] = position.account_type
  }

  return {
    accountFilterLabels: buildAccountFilterLabels(positions, accountLabels),
    accountToType,
    allAccounts: [...new Set(positions.map(accountFilterId))].sort(),
    allAccountTypes: [
      ...new Set(
        positions
          .map((position) => position.account_type)
          .filter((type): type is string => !!type),
      ),
    ].sort(),
    allOperationTypes: [
      ...new Set(positions.flatMap((position) => [...position.operationTypes])),
    ].sort(),
  }
}

export type FilterSummaryKey = 'accounts' | 'period' | 'operations' | 'closed-positions'

export interface FilterSummaryItem {
  key: FilterSummaryKey
  label: string
}

export interface FilterVisibility {
  showPeriod: boolean
  showPositionFilters: boolean
}

const OP_LABELS: Record<string, string> = {
  BUY: i18n.t('ui.portfoliofilters.buy'),
  SELL: i18n.t('ui.portfoliofilters.sell'),
  DIVIDEND: i18n.t('ui.portfoliofilters.dividend'),
  INTEREST: i18n.t('ui.portfoliofilters.interest'),
  DEPOSIT: i18n.t('ui.portfoliofilters.deposit'),
  WITHDRAWAL: i18n.t('ui.portfoliofilters.withdrawal'),
}

export function filterVisibilityForTab(
  tab: string,
  holdingsView: 'positions' | 'underlying' = 'positions',
): FilterVisibility {
  const positionsView = tab === 'positions' || (tab === 'holdings' && holdingsView === 'positions')
  return {
    showPeriod: true,
    showPositionFilters: positionsView,
  }
}

export function filterSummaries(
  filters: Filters,
  accountLabels: Record<string, string>,
  visibility: FilterVisibility,
): FilterSummaryItem[] {
  const summaries: FilterSummaryItem[] = []

  if (filters.accounts.size === 1) {
    const account = [...filters.accounts][0]
    summaries.push({ key: 'accounts', label: accountLabel(account, accountLabels) })
  } else if (filters.accounts.size > 1) {
    summaries.push({ key: 'accounts', label: i18n.t('ui.portfoliofiltersTs.value0Accounts', { value0: filters.accounts.size }) })
  }

  if (visibility.showPeriod && (filters.dateFrom || filters.dateTo)) {
    let label = i18n.t('ui.portfoliofilters.untilDate', { date: filters.dateTo })
    if (filters.dateFrom && filters.dateTo) {
      label = i18n.t('ui.portfoliofilters.dateRange', { from: filters.dateFrom, to: filters.dateTo })
    } else if (filters.dateFrom) {
      label = i18n.t('ui.portfoliofilters.sinceDate', { date: filters.dateFrom })
    }
    summaries.push({ key: 'period', label })
  }

  if (visibility.showPositionFilters && filters.operationTypes.size === 1) {
    const operation = [...filters.operationTypes][0]
    summaries.push({ key: 'operations', label: OP_LABELS[operation] ?? operation })
  } else if (visibility.showPositionFilters && filters.operationTypes.size > 1) {
    summaries.push({ key: 'operations', label: i18n.t('ui.portfoliofiltersTs.value0OperationTypes', { value0: filters.operationTypes.size }) })
  }

  if (visibility.showPositionFilters && !filters.hideClosedPositions) {
    summaries.push({ key: 'closed-positions', label: i18n.t('ui.portfoliofiltersTs.closedPositionsIncluded') })
  }

  return summaries
}

export function clearFilterGroup(filters: Filters, key: FilterSummaryKey): Filters {
  if (key === 'accounts') return { ...filters, accounts: new Set(), accountTypes: new Set() }
  if (key === 'period') return { ...filters, dateFrom: undefined, dateTo: undefined }
  if (key === 'operations') return { ...filters, operationTypes: new Set() }
  return { ...filters, hideClosedPositions: true }
}

export function resetFilters(): Filters {
  return {
    accountTypes: new Set<string>(),
    accounts: new Set<string>(),
    operationTypes: new Set<string>(),
    hideClosedPositions: true,
  }
}

export function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function presetDateFrom(months: number): string {
  const now = new Date()
  if (months === 0) return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const d = new Date(now)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}
