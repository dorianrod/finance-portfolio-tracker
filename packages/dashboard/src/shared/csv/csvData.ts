import Papa from 'papaparse'

// All dashboard data is fetched at runtime from <base>/data/*.csv (see
// vite.config.ts's serveFinanceData plugin in dev, or public/data/ once
// copied in for a build). Routing every call through this URL builder
// keeps fetches working under a non-root --base (e.g. GitHub Pages
// project sites at /<repo>/), since import.meta.env.BASE_URL is the only
// thing Vite rewrites for a configured base.
export function dataUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}data/${filename}`
}

export function parseCsv<T = Record<string, string>>(url: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: reject,
    })
  })
}
