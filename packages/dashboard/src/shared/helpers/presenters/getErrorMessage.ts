import { ValidationError } from 'yup'

import i18n from '@/i18n/i18n'
import { HttpError } from '@/shared/http/httpError'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) return i18n.t('ui.errors.invalidData')
  if (error instanceof HttpError) {
    if (error.status === 404) return i18n.t('ui.errors.dataMissing')
    if (error.status === 403) return i18n.t('ui.errors.accessDenied')
    if (error.message !== `HTTP ${error.status}`)
      return translateKnownError(error.message)
    return i18n.t('ui.errors.requestFailed', { status: error.status })
  }
  if (error instanceof Error && error.message)
    return translateKnownError(error.message)
  return i18n.t('ui.errors.unexpected')
}

function translateKnownError(message: string): string {
  switch (message) {
    case 'ui.errors.invalidData':
      return i18n.t('ui.errors.invalidData')
    case 'ui.errors.dataMissing':
      return i18n.t('ui.errors.dataMissing')
    case 'ui.errors.accessDenied':
      return i18n.t('ui.errors.accessDenied')
    case 'ui.errors.unexpected':
      return i18n.t('ui.errors.unexpected')
    default:
      return message
  }
}
