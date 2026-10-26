import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import { parseCsv } from '@/shared/csv/csvData'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate.schema'

export function usePipelineErrorsQuery() {
  return useQuery<PipelineError[]>({
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
