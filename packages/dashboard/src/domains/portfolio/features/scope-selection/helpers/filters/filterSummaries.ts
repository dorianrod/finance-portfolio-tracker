import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'

import type {
  FilterSummaryItem,
  FilterVisibility,
} from './portfolioFilters.types'

export function filterSummaries(
  filters: DashboardFilters,
  accountLabels: Record<string, string>,
  visibility: FilterVisibility,
  formatDate: (date: Date) => string,
): FilterSummaryItem[] {
  return [
    accountSummary(filters, accountLabels),
    visibility.showPeriod ? periodSummary(filters, formatDate) : null,
    visibility.showPositionFilters ? operationSummary(filters) : null,
    visibility.showPositionFilters && !filters.hideClosedPositions
      ? {
          key: 'closed-positions' as const,
          label: i18n.t('ui.portfoliofiltersTs.closedPositionsIncluded'),
        }
      : null,
  ].filter((item): item is FilterSummaryItem => item !== null)
}

const OP_LABELS: Record<OperationType, string> = {
  BUY: i18n.t('ui.portfoliofilters.buy'),
  SELL: i18n.t('ui.portfoliofilters.sell'),
  DIVIDEND: i18n.t('ui.portfoliofilters.dividend'),
  INTEREST: i18n.t('ui.portfoliofilters.interest'),
  DEPOSIT: i18n.t('ui.portfoliofilters.deposit'),
  WITHDRAWAL: i18n.t('ui.portfoliofilters.withdrawal'),
}

function accountSummary(
  filters: DashboardFilters,
  accountLabels: Record<string, string>,
): FilterSummaryItem | null {
  if (filters.accounts.size === 0) return null
  const account = [...filters.accounts][0]
  return {
    key: 'accounts',
    label:
      filters.accounts.size === 1
        ? accountLabel(account, accountLabels)
        : i18n.t('ui.portfoliofiltersTs.value0Accounts', {
            value0: filters.accounts.size,
          }),
  }
}

function periodSummary(
  filters: DashboardFilters,
  formatDate: (date: Date) => string,
): FilterSummaryItem | null {
  if (!filters.dateFrom && !filters.dateTo) return null
  let label = i18n.t('ui.portfoliofilters.untilDate', {
    date: filters.dateTo ? formatDate(filters.dateTo) : '',
  })
  if (filters.dateFrom && filters.dateTo) {
    label = i18n.t('ui.portfoliofilters.dateRange', {
      from: formatDate(filters.dateFrom),
      to: formatDate(filters.dateTo),
    })
  } else if (filters.dateFrom) {
    label = i18n.t('ui.portfoliofilters.sinceDate', {
      date: formatDate(filters.dateFrom),
    })
  }
  return { key: 'period', label }
}

function operationSummary(filters: DashboardFilters): FilterSummaryItem | null {
  if (filters.operationTypes.size === 0) return null
  const operation = [...filters.operationTypes][0]
  return {
    key: 'operations',
    label:
      filters.operationTypes.size === 1
        ? OP_LABELS[operation]
        : i18n.t('ui.portfoliofiltersTs.value0OperationTypes', {
            value0: filters.operationTypes.size,
          }),
  }
}
