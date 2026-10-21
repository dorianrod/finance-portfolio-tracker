import type { Filters } from '@/types/filters'

export function accountLabel(account: string, labels: Record<string, string>): string {
  if (labels[account]) return labels[account]
  return account.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
  BUY: 'Buy',
  SELL: 'Sell',
  DIVIDEND: 'Dividend',
  INTEREST: 'Interest',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
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
    summaries.push({ key: 'accounts', label: `${filters.accounts.size} accounts` })
  }

  if (visibility.showPeriod && (filters.dateFrom || filters.dateTo)) {
    const label = filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : filters.dateFrom
        ? `Since ${filters.dateFrom}`
        : `Until ${filters.dateTo}`
    summaries.push({ key: 'period', label })
  }

  if (visibility.showPositionFilters && filters.operationTypes.size === 1) {
    const operation = [...filters.operationTypes][0]
    summaries.push({ key: 'operations', label: OP_LABELS[operation] ?? operation })
  } else if (visibility.showPositionFilters && filters.operationTypes.size > 1) {
    summaries.push({ key: 'operations', label: `${filters.operationTypes.size} operation types` })
  }

  if (visibility.showPositionFilters && !filters.hideClosedPositions) {
    summaries.push({ key: 'closed-positions', label: 'Closed positions included' })
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
