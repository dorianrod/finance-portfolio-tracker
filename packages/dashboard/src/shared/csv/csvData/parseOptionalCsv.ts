import type { Schema } from 'yup'

import { HttpError } from '@/shared/http/httpError'

import { parseCsv } from './parseCsv'

export async function parseOptionalCsv<T>(
  url: string,
  rowSchema: Schema<T>,
): Promise<T[]> {
  try {
    return await parseCsv(url, rowSchema)
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return []
    throw error
  }
}
