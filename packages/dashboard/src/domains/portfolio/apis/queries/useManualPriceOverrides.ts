import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { dataUrl } from '@/shared/csv/csvData'

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
    Papa.parse<ManualPriceOverride>(dataUrl('manual_price_overrides.csv'), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => setManualPriceOverrides(result.data),
      error: () => setManualPriceOverrides([]),
    })
  }, [])

  return { manualPriceOverrides }
}
