import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import * as yup from 'yup'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

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
  return useQuery({
    queryKey: portfolioQueryKeys.data('manual-price-overrides'),
    queryFn: () => parseCsv(
      PORTFOLIO_ENDPOINTS.data.manualPriceOverrides,
      MANUAL_PRICE_OVERRIDE_SCHEMA,
    ),
  })
}
