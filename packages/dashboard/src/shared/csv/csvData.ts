import Papa from 'papaparse'

const csvRequests = new Map<string, Promise<unknown[]>>()

export function parseCsv<T = Record<string, string>>(url: string): Promise<T[]> {
  const cachedRequest = csvRequests.get(url)
  if (cachedRequest) return cachedRequest as Promise<T[]>

  const request = new Promise<T[]>((resolve, reject) => {
    Papa.parse<T>(url, {
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

export function clearCsvCache(): void {
  csvRequests.clear()
}
