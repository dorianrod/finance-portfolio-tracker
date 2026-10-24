import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import * as yup from 'yup'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'

const ERROR_ROW_SCHEMA: yup.ObjectSchema<PipelineError> = yup.object({
  source: yup.string().defined(),
  level: yup.string<PipelineError['level']>().oneOf(['error', 'warning']).defined(),
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
