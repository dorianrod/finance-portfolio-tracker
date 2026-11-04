import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { PipelineIssueStatus } from '@/domains/portfolio/features/data-quality/features/assessment/types/pipelineIssueStatus.type'

export function useFormatPipelineStatus() {
  const { t } = useTranslation()
  return useCallback(
    (
      status: PipelineIssueStatus | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (status == null) return fallback
      if (status.loading) return t('ui.analysisreliability.loading')
      const count = status.errorCount + status.warningCount
      if (count === 0) return t('ui.analysisreliability.noAnomaly')
      return t('ui.analysisreliability.anomalyCount', { count })
    },
    [t],
  )
}
