import { useSuspenseQueries } from '@tanstack/react-query'

import { PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioManualPriceOverridesQueryOptions'
import { PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioPipelineErrorsQueryOptions'

export function useGetQualitySourcesQuery() {
  return useSuspenseQueries({
    queries: [
      PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS,
      PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS,
    ],
  })
}
