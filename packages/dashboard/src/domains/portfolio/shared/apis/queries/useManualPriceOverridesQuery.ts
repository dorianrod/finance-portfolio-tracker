import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import { parseCsv } from '@/shared/csv/csvData'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate.schema'

const MANUAL_PRICE_OVERRIDE_SCHEMA: yup.ObjectSchema<ManualPriceOverride> =
  yup.object({
    name: yup.string().defined(),
    ticker: yup.string().defined(),
    isin: yup.string().defined(),
    price: yup
      .number()
      .required()
      .test('finite', 'Price must be finite', Number.isFinite),
    currency: yup
      .string()
      .trim()
      .uppercase()
      .transform((value: string) => value || 'EUR')
      .default('EUR')
      .matches(/^[A-Z]{3}$/)
      .defined(),
    date_from: OPTIONAL_CALENDAR_DATE_SCHEMA,
    date_to: OPTIONAL_CALENDAR_DATE_SCHEMA,
    source_file: yup.string().defined(),
  })

export function useManualPriceOverridesQuery() {
  return useQuery<ManualPriceOverride[]>({
    queryKey: portfolioQueryKeys.data('manual-price-overrides'),
    queryFn: () =>
      parseCsv(
        PORTFOLIO_ENDPOINTS.data.manualPriceOverrides,
        MANUAL_PRICE_OVERRIDE_SCHEMA,
      ),
  })
}
