// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies these source anomalies to both quality assessment summaries and pipeline error tables. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

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

const MANUAL_PRICE_OVERRIDE_SCHEMA: yup.ObjectSchema<ManualPriceOverride> =
  yup.object({
    name: yup.string().defined(),
    ticker: yup.string().defined(),
    isin: yup.string().defined(),
    price: FINITE_NUMBER_SCHEMA.required(),
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
