import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'

export function useFormatOperationType() {
  const { t } = useTranslation()
  return useCallback(
    (
      operation: OperationType | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (operation == null) return fallback
      const labels: Record<OperationType, string> = {
        BUY: t('ui.filterbar.buy'),
        SELL: t('ui.filterbar.sell'),
        DIVIDEND: t('ui.filterbar.dividend'),
        INTEREST: t('ui.filterbar.interest'),
        DEPOSIT: t('ui.filterbar.deposit'),
        WITHDRAWAL: t('ui.filterbar.withdrawal'),
      }
      return labels[operation]
    },
    [t],
  )
}
