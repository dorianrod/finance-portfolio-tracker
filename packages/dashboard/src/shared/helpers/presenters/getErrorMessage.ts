import { ValidationError } from 'yup'

import i18n from '@/i18n/i18n'
import { HttpError } from '@/shared/http/httpError'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) return i18n.t('ui.errors.invalidData')
  if (error instanceof HttpError) {
    if (error.status === 404) return i18n.t('ui.errors.dataMissing')
    if (error.status === 403) return i18n.t('ui.errors.accessDenied')
    if (error.message !== `HTTP ${error.status}`) return error.message
    return i18n.t('ui.errors.requestFailed', { status: error.status })
  }
  if (error instanceof Error && error.message) return error.message
  return i18n.t('ui.errors.unexpected')
}
