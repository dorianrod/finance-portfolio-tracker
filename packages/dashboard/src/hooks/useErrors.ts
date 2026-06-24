import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { dataUrl } from '@/shared/csv/csvData'

export interface ErrorRow {
  source: string   // "main" | "fetch_prices"
  level: string    // "error" | "warning"
  type: string     // "unresolved_ticker" | "missing_price" | "missing_fx_rate" | "parsing_error" | "missing_data"
  date: string
  account: string
  isin: string
  ticker: string
  name: string
  message: string
}

export function useErrors() {
  const [errors, setErrors] = useState<ErrorRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Papa.parse<ErrorRow>(dataUrl('errors.csv'), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        setErrors(r.data)
        setLoading(false)
      },
      error: () => {
        setErrors([])
        setLoading(false)
      },
    })
  }, [])

  return { errors, loading }
}
