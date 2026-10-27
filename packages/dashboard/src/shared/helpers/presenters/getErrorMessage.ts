import { ValidationError } from 'yup'

import i18n from '@/i18n/i18n'
import { HttpError } from '@/shared/http/httpError'
import { isNetworkError } from '@/shared/http/isNetworkError'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError || error instanceof SyntaxError)
    return i18n.t('ui.errors.invalidData')
  if (error instanceof Error && error.message)
    return getRequestErrorMessage(error) ?? translateKnownError(error.message)
  return i18n.t('ui.errors.unexpected')
}

function getRequestErrorMessage(error: Error): string | null {
  if (error.name === 'TimeoutError') return i18n.t('ui.errors.timeout')
  if (isNetworkError(error)) return i18n.t('ui.errors.network')
  return error instanceof HttpError ? getHttpErrorMessage(error) : null
}

function getHttpErrorMessage(error: HttpError): string {
  if (error.status === 404) return i18n.t('ui.errors.dataMissing')
  if (error.status === 403) return i18n.t('ui.errors.accessDenied')
  if (error.message !== `HTTP ${error.status}`)
    return translateKnownError(error.message)
  return i18n.t('ui.errors.requestFailed', { status: error.status })
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
    case 'ui.errors.network':
      return i18n.t('ui.errors.network')
    case 'ui.errors.timeout':
      return i18n.t('ui.errors.timeout')
    default:
      return message
  }
}
