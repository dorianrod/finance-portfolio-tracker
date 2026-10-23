import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import * as yup from 'yup'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

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

const ERROR_ROW_SCHEMA: yup.ObjectSchema<ErrorRow> = yup.object({
  source: yup.string().defined(),
  level: yup.string().defined(),
  type: yup.string().defined(),
  date: yup.string().defined(),
  account: yup.string().defined(),
  isin: yup.string().defined(),
  ticker: yup.string().defined(),
  name: yup.string().defined(),
  message: yup.string().defined(),
})

export function useErrors() {
  return useQuery({
    queryKey: portfolioQueryKeys.data('pipeline-errors'),
    queryFn: () => parseCsv(PORTFOLIO_ENDPOINTS.data.errors, ERROR_ROW_SCHEMA),
  })
}
