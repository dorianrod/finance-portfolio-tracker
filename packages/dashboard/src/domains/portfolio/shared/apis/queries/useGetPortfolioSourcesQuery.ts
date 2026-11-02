import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'
import { getPortfolioDashboardQueryOptions } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioDashboardQueryOptions'
import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioFundHoldingsQueryOptions'
import { PORTFOLIO_HISTORY_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioHistoryQueryOptions'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'

/*
 * @architecture-decision required-portfolio-source-batch
 * @rules api-vercel-parallel-work, api-query-hook-choice, arch-shared-no-domain-knowledge
 * @choice Start common required sources together; route entrypoints require this same batch before reading their cached models.
 * @reason The shell must stay editable during startup, while a route mounted independently must suspend rather than render missing sources as empty financial data.
 * @alternative Calling several suspense hooks sequentially introduces a cold-cache waterfall; moving TanStack calls to app breaks domain API ownership.
 * @revisit Capabilities acquire independently usable source lifecycles instead of the current all-source dashboard gate.
 */
export function useGetPortfolioSourcesQuery() {
  const queryClient = useQueryClient()
  return useSuspenseQueries({
    queries: [
      getPortfolioDashboardQueryOptions(queryClient),
      PORTFOLIO_HISTORY_QUERY_OPTIONS,
      PORTFOLIO_POSITIONS_QUERY_OPTIONS,
      PORTFOLIO_ALLOCATION_QUERY_OPTIONS,
      PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS,
    ],
  })
}
