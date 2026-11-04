import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { GroupRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useFormatOperationGroupLabel() {
  const { t } = useTranslation()
  return useCallback(
    (
      group: GroupRow['groupType'] | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (group == null) return fallback
      const labels: Record<GroupRow['groupType'], string> = {
        trades: t('ui.buildpositionhierarchyTs.buysSells'),
        dividends: t('ui.buildpositionhierarchyTs.dividends'),
        interest: t('ui.buildpositionhierarchyTs.interest'),
        cash: t('ui.buildpositionhierarchyTs.depositsWithdrawals'),
      }
      return labels[group]
    },
    [t],
  )
}
