import { type InferType, type Schema } from 'yup'

import { HttpError } from '@/shared/http/httpError'

import { parseCsv } from './parseCsv'

export async function parseOptionalCsv<S extends Schema>(
  url: string,
  rowSchema: S,
): Promise<InferType<S>[]> {
  try {
    return await parseCsv(url, rowSchema)
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return []
    throw error
  }
}
