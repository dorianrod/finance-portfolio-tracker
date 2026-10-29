import { ValidationError } from 'yup'

import { HttpError } from '@/shared/http/httpError'
import { isNetworkError } from '@/shared/http/isNetworkError'
import type {
  RequestError,
  RequestErrorCode,
} from '@/shared/types/requestError.type'

export function normalizeRequestError(error: unknown): RequestError {
  if (error instanceof ValidationError || error instanceof SyntaxError)
    return { kind: 'known', code: 'invalid-data' }
  if (error instanceof DOMException && error.name === 'TimeoutError')
    return { kind: 'known', code: 'timeout' }
  if (error instanceof Error && error.message) return normalizeError(error)
  return { kind: 'known', code: 'unexpected' }
}

const KNOWN_ERROR_CODES = new Map<string, RequestErrorCode>([
  ['ui.errors.invalidData', 'invalid-data'],
  ['ui.errors.dataMissing', 'missing-data'],
  ['ui.errors.accessDenied', 'access-denied'],
  ['ui.errors.unexpected', 'unexpected'],
  ['ui.errors.network', 'network'],
  ['ui.errors.timeout', 'timeout'],
])

function normalizeError(error: Error): RequestError {
  if (error.name === 'TimeoutError') return { kind: 'known', code: 'timeout' }
  if (isNetworkError(error)) return { kind: 'known', code: 'network' }
  if (error instanceof HttpError) return normalizeHttpError(error)
  return normalizeMessage(error.message)
}

function normalizeHttpError(error: HttpError): RequestError {
  if (error.status === 404) return { kind: 'known', code: 'missing-data' }
  if (error.status === 403) return { kind: 'known', code: 'access-denied' }
  if (error.message === `HTTP ${error.status}`)
    return { kind: 'http', status: error.status }
  return normalizeMessage(error.message)
}

function normalizeMessage(message: string): RequestError {
  const code = KNOWN_ERROR_CODES.get(message)
  return code ? { kind: 'known', code } : { kind: 'message', message }
}
