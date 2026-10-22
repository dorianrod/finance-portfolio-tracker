import Papa from 'papaparse'
import { array, type InferType, type Schema } from 'yup'

const csvRequests = new Map<string, Promise<unknown[]>>()

function loadCsv(url: string): Promise<unknown[]> {
  const cachedRequest = csvRequests.get(url)
  if (cachedRequest) return cachedRequest

  const request = new Promise<unknown[]>((resolve, reject) => {
    Papa.parse<unknown>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: reject,
    })
  })

  csvRequests.set(url, request)
  void request.catch(() => {
    if (csvRequests.get(url) === request) csvRequests.delete(url)
  })

  return request
}

export async function parseCsv<S extends Schema>(url: string, rowSchema: S): Promise<InferType<S>[]> {
  const rows = await loadCsv(url)
  return array(rowSchema).defined().validate(rows, {
    abortEarly: false,
    stripUnknown: true,
  })
}

export function clearCsvCache(): void {
  csvRequests.clear()
}
