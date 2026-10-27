import Papa from 'papaparse'

import { HttpError } from '@/shared/http/httpError'

import { csvRequests } from './csvRequests'

export function loadCsv(url: string): Promise<unknown[]> {
  const cachedRequest = csvRequests.get(url)
  if (cachedRequest) return cachedRequest

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new HttpError(response.status)
      if (response.headers.get('content-type')?.includes('text/html')) {
        throw new SyntaxError('Expected CSV data, received HTML')
      }
      const result = Papa.parse<unknown>(await response.text(), {
        header: true,
        skipEmptyLines: true,
      })
      const parseError = result.errors.find(
        (error) => error.code !== 'UndetectableDelimiter',
      )
      if (parseError) throw new SyntaxError(parseError.message)
      return result.data
    })
    .finally(() => {
      if (csvRequests.get(url) === request) csvRequests.delete(url)
    })

  // Only deduplicate in-flight requests; TanStack Query owns cached server data.
  csvRequests.set(url, request)

  return request
}
