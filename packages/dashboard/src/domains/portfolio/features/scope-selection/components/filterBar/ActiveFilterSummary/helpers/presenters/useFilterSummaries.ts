import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatOperationType } from '@/domains/portfolio/features/scope-selection/helpers/formatters/useFormatOperationType'
import type {
  FilterSummaryItem,
  FilterVisibility,
} from '@/domains/portfolio/features/scope-selection/types/portfolioFilterPresentation.type'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFilterSummaries(
  filters: DashboardFilters,
  accountLabels: Record<string, string>,
  visibility: FilterVisibility,
): FilterSummaryItem[] {
  const { t } = useTranslation()

  const accountSummary = useCallback(
    (
      filters: DashboardFilters,
      selectedAccountLabel: string,
    ): FilterSummaryItem | null => {
      if (filters.accounts.size === 0) return null
      return {
        key: 'accounts',
        label:
          filters.accounts.size === 1
            ? selectedAccountLabel
            : t('ui.portfoliofiltersTs.value0Accounts', {
                value0: filters.accounts.size,
              }),
      }
    },
    [t],
  )

  const periodSummary = useCallback(
    (from: string, to: string): FilterSummaryItem | null => {
      if (!from && !to) return null
      let label = t('ui.portfoliofilters.untilDate', {
        date: to,
      })
      if (from && to) {
        label = t('ui.portfoliofilters.dateRange', {
          from,
          to,
        })
      } else if (from) {
        label = t('ui.portfoliofilters.sinceDate', {
          date: from,
        })
      }
      return { key: 'period', label }
    },
    [t],
  )

  const operationSummary = useCallback(
    (
      filters: DashboardFilters,
      operationLabel: string,
    ): FilterSummaryItem | null => {
      if (filters.operationTypes.size === 0) return null
      return {
        key: 'operations',
        label:
          filters.operationTypes.size === 1
            ? operationLabel
            : t('ui.portfoliofiltersTs.value0OperationTypes', {
                value0: filters.operationTypes.size,
              }),
      }
    },
    [t],
  )

  const formatAccountLabel = useFormatAccountLabel()
  const formatDate = useFormatDate()
  const formatOperationType = useFormatOperationType()
  return useMemo(
    () =>
      [
        accountSummary(
          filters,
          formatAccountLabel([...filters.accounts][0], {
            labels: accountLabels,
          }),
        ),
        visibility.showPeriod
          ? periodSummary(
              formatDate(filters.dateFrom, { style: 'isoDate', fallback: '' }),
              formatDate(filters.dateTo, { style: 'isoDate', fallback: '' }),
            )
          : null,
        visibility.showPositionFilters
          ? operationSummary(
              filters,
              formatOperationType([...filters.operationTypes][0]),
            )
          : null,
        visibility.showPositionFilters && !filters.hideClosedPositions
          ? {
              key: 'closed-positions' as const,
              label: t('ui.portfoliofiltersTs.closedPositionsIncluded'),
            }
          : null,
      ].filter((item): item is FilterSummaryItem => item !== null),
    [
      t,
      accountSummary,
      operationSummary,
      periodSummary,
      filters,
      accountLabels,
      visibility,
      formatAccountLabel,
      formatDate,
      formatOperationType,
    ],
  )
}
