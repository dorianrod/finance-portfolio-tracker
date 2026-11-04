import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useFormatPipelineErrorType() {
  const { t } = useTranslation()
  return useCallback(
    (
      type: string | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (type == null || type === '') return fallback
      const labels = new Map([
        [
          'unresolved_ticker',
          t('ui.buildpipelineerrorsviewmodel.unresolvedTicker'),
        ],
        ['missing_price', t('ui.buildpipelineerrorsviewmodel.missingPrice')],
        ['missing_fx_rate', t('ui.buildpipelineerrorsviewmodel.missingFxRate')],
        ['parsing_error', t('ui.buildpipelineerrorsviewmodel.parsingError')],
        ['missing_data', t('ui.buildpipelineerrorsviewmodel.missingData')],
      ])
      return labels.get(type) ?? type
    },
    [t],
  )
}
