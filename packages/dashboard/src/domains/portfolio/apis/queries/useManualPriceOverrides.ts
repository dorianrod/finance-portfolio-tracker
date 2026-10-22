import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import * as yup from 'yup'

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

const MANUAL_PRICE_OVERRIDE_SCHEMA: yup.ObjectSchema<ManualPriceOverride> = yup.object({
  name: yup.string().defined(),
  ticker: yup.string().defined(),
  isin: yup.string().defined(),
  price: yup.string().defined(),
  currency: yup.string().defined(),
  date_from: yup.string().defined(),
  date_to: yup.string().defined(),
  source_file: yup.string().defined(),
})

export function useManualPriceOverrides() {
  const [manualPriceOverrides, setManualPriceOverrides] = useState<ManualPriceOverride[]>([])

  useEffect(() => {
    parseCsv(PORTFOLIO_ENDPOINTS.data.manualPriceOverrides, MANUAL_PRICE_OVERRIDE_SCHEMA)
      .then(setManualPriceOverrides)
      .catch(() => setManualPriceOverrides([]))
  }, [])

  return { manualPriceOverrides }
}
