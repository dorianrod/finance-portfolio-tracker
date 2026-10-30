import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { FundDiagnosticsFilter } from '@/domains/portfolio/features/data-quality/features/assessment/components/FundDataQualityPanel/helpers/transformers/buildFundDiagnosticsRows'
import { useFormatFundQualityCategory } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityCategory'

export function useFormatFundDiagnosticsFilter() {
  const { t } = useTranslation()
  const formatCategory = useFormatFundQualityCategory()
  return useCallback(
    (
      filter: FundDiagnosticsFilter | null | undefined,
      options: { fallback?: string } = {},
    ): string => {
      if (filter === 'issues') return t('ui.funddataqualitypanel.issues')
      if (filter === 'all') return t('ui.funddataqualitypanel.all')
      return formatCategory(filter, options)
    },
    [t, formatCategory],
  )
}
