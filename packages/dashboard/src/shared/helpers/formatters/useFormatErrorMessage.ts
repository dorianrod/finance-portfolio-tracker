import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { normalizeRequestError } from '@/shared/helpers/transformers/normalizeRequestError'
import type { RequestErrorCode } from '@/shared/types/requestError.type'

export function useFormatErrorMessage() {
  const { t } = useTranslation()
  return useCallback(
    (
      error: unknown,
      { fallback = t('ui.errors.unexpected') }: { fallback?: string } = {},
    ): string => {
      if (error == null) return fallback
      const normalized = normalizeRequestError(error)
      if (normalized.kind === 'message') return normalized.message
      if (normalized.kind === 'http')
        return t('ui.errors.requestFailed', { status: normalized.status })
      const labels: Record<RequestErrorCode, string> = {
        'invalid-data': t('ui.errors.invalidData'),
        'missing-data': t('ui.errors.dataMissing'),
        'access-denied': t('ui.errors.accessDenied'),
        unexpected: t('ui.errors.unexpected'),
        network: t('ui.errors.network'),
        timeout: t('ui.errors.timeout'),
      }
      return labels[normalized.code]
    },
    [t],
  )
}
