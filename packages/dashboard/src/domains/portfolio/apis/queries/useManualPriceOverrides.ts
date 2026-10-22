import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

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
    parseCsv<ManualPriceOverride>(dataUrl('manual_price_overrides.csv'))
      .then(setManualPriceOverrides)
      .catch(() => setManualPriceOverrides([]))
  }, [])

  return { manualPriceOverrides }
}
