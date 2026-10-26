import Papa from 'papaparse'
import { array, type InferType, type Schema } from 'yup'

import { HttpError } from '@/shared/http/httpError'

export async function parseCsv<S extends Schema>(
  url: string,
  rowSchema: S,
): Promise<InferType<S>[]> {
  const rows = await loadCsv(url)
  return array(rowSchema).defined().validate(rows, {
    abortEarly: false,
    stripUnknown: true,
  })
}

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

export function clearCsvCache(): void {
  csvRequests.clear()
}

const csvRequests = new Map<string, Promise<unknown[]>>()

function loadCsv(url: string): Promise<unknown[]> {
  const cachedRequest = csvRequests.get(url)
  if (cachedRequest) return cachedRequest

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new HttpError(response.status)
      if (response.headers.get('content-type')?.includes('text/html')) {
        throw new Error('Expected CSV data, received HTML')
      }
      const result = Papa.parse<unknown>(await response.text(), {
        header: true,
        skipEmptyLines: true,
      })
      const parseError = result.errors.find(
        (error) => error.code !== 'UndetectableDelimiter',
      )
      if (parseError) throw new Error(parseError.message)
      return result.data
    })
    .finally(() => {
      if (csvRequests.get(url) === request) csvRequests.delete(url)
    })

  // Only deduplicate in-flight requests; TanStack Query owns cached server data.
  csvRequests.set(url, request)

  return request
}
