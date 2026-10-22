import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'

export interface ManualPriceOverride {
  name: string
  ticker: string
  isin: string
  price: string
  currency: string
  date_from: string
  date_to: string
  source_file: string
}

export function useManualPriceOverrides() {
  const [manualPriceOverrides, setManualPriceOverrides] = useState<ManualPriceOverride[]>([])

  useEffect(() => {
    parseCsv<ManualPriceOverride>(PORTFOLIO_ENDPOINTS.data.manualPriceOverrides)
      .then(setManualPriceOverrides)
      .catch(() => setManualPriceOverrides([]))
  }, [])

  return { manualPriceOverrides }
}
