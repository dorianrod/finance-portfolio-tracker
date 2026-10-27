import { useMemo } from 'react'

import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

import type {
  FilterSummaryItem,
  FilterVisibility,
} from './portfolioFilters.types'

export function useFilterSummaries(
  filters: DashboardFilters,
  accountLabels: Record<string, string>,
  visibility: FilterVisibility,
): FilterSummaryItem[] {
  const formatDate = useFormatDate()
  return useMemo(
    () =>
      [
        accountSummary(filters, accountLabels),
        visibility.showPeriod
          ? periodSummary(
              filters.dateFrom
                ? formatDate(filters.dateFrom, { style: 'isoDate' })
                : undefined,
              filters.dateTo
                ? formatDate(filters.dateTo, { style: 'isoDate' })
                : undefined,
            )
          : null,
        visibility.showPositionFilters ? operationSummary(filters) : null,
        visibility.showPositionFilters && !filters.hideClosedPositions
          ? {
              key: 'closed-positions' as const,
              label: i18n.t('ui.portfoliofiltersTs.closedPositionsIncluded'),
            }
          : null,
      ].filter((item): item is FilterSummaryItem => item !== null),
    [filters, accountLabels, visibility, formatDate],
  )
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
  from: string | undefined,
  to: string | undefined,
): FilterSummaryItem | null {
  if (!from && !to) return null
  let label = i18n.t('ui.portfoliofilters.untilDate', {
    date: to,
  })
  if (from && to) {
    label = i18n.t('ui.portfoliofilters.dateRange', {
      from,
      to,
    })
  } else if (from) {
    label = i18n.t('ui.portfoliofilters.sinceDate', {
      date: from,
    })
  }
  return { key: 'period', label }
}

function operationSummary(filters: DashboardFilters): FilterSummaryItem | null {
  if (filters.operationTypes.size === 0) return null
  const labels: Record<OperationType, string> = {
    BUY: i18n.t('ui.portfoliofilters.buy'),
    SELL: i18n.t('ui.portfoliofilters.sell'),
    DIVIDEND: i18n.t('ui.portfoliofilters.dividend'),
    INTEREST: i18n.t('ui.portfoliofilters.interest'),
    DEPOSIT: i18n.t('ui.portfoliofilters.deposit'),
    WITHDRAWAL: i18n.t('ui.portfoliofilters.withdrawal'),
  }
  const operation = [...filters.operationTypes][0]
  return {
    key: 'operations',
    label:
      filters.operationTypes.size === 1
        ? labels[operation]
        : i18n.t('ui.portfoliofiltersTs.value0OperationTypes', {
            value0: filters.operationTypes.size,
          }),
  }
}
