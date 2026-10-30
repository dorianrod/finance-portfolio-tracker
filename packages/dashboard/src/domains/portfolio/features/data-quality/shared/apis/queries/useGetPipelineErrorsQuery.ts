// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies these source anomalies to both quality assessment summaries and pipeline error tables. See SHARED_OWNERSHIP_AUDIT.md.
import { useSuspenseQuery } from '@tanstack/react-query'
import * as yup from 'yup'

import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

export function useGetPipelineErrorsQuery() {
  return useSuspenseQuery<PipelineError[]>({
    queryKey: portfolioQueryKeys.data('pipeline-errors'),
    queryFn: () => parseCsv(PORTFOLIO_ENDPOINTS.data.errors, ERROR_ROW_SCHEMA),
  })
}

const ERROR_ROW_SCHEMA: yup.ObjectSchema<PipelineError> = yup.object({
  source: yup.string().defined(),
  level: yup
    .string<PipelineError['level']>()
    .oneOf(['error', 'warning'])
    .defined(),
  type: yup.string().defined(),
  date: OPTIONAL_CALENDAR_DATE_SCHEMA,
  account: yup.string().defined(),
  isin: yup.string().defined(),
  ticker: yup.string().defined(),
  name: yup.string().defined(),
  message: yup.string().defined(),
})
