import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

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
    parseCsv<ErrorRow>(dataUrl('errors.csv'))
      .then((rows) => {
        setErrors(rows)
        setLoading(false)
      })
      .catch(() => {
        setErrors([])
        setLoading(false)
      })
  }, [])

  return { errors, loading }
}
