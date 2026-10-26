import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'

import { accountLabel } from './accountLabel'
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
  const summaries: FilterSummaryItem[] = []

  if (filters.accounts.size === 1) {
    const account = [...filters.accounts][0]
    summaries.push({
      key: 'accounts',
      label: accountLabel(account, accountLabels),
    })
  } else if (filters.accounts.size > 1) {
    summaries.push({
      key: 'accounts',
      label: i18n.t('ui.portfoliofiltersTs.value0Accounts', {
        value0: filters.accounts.size,
      }),
    })
  }

  if (visibility.showPeriod && (filters.dateFrom || filters.dateTo)) {
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
    summaries.push({ key: 'period', label })
  }

  if (visibility.showPositionFilters && filters.operationTypes.size === 1) {
    const operation = [...filters.operationTypes][0]
    summaries.push({ key: 'operations', label: OP_LABELS[operation] })
  } else if (
    visibility.showPositionFilters &&
    filters.operationTypes.size > 1
  ) {
    summaries.push({
      key: 'operations',
      label: i18n.t('ui.portfoliofiltersTs.value0OperationTypes', {
        value0: filters.operationTypes.size,
      }),
    })
  }

  if (visibility.showPositionFilters && !filters.hideClosedPositions) {
    summaries.push({
      key: 'closed-positions',
      label: i18n.t('ui.portfoliofiltersTs.closedPositionsIncluded'),
    })
  }

  return summaries
}

const OP_LABELS: Record<OperationType, string> = {
  BUY: i18n.t('ui.portfoliofilters.buy'),
  SELL: i18n.t('ui.portfoliofilters.sell'),
  DIVIDEND: i18n.t('ui.portfoliofilters.dividend'),
  INTEREST: i18n.t('ui.portfoliofilters.interest'),
  DEPOSIT: i18n.t('ui.portfoliofilters.deposit'),
  WITHDRAWAL: i18n.t('ui.portfoliofilters.withdrawal'),
}
