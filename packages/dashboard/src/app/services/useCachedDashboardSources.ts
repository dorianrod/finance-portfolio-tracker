import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import { PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioManualPriceOverridesQueryOptions'
import { PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioPipelineErrorsQueryOptions'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'
import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioFundHoldingsQueryOptions'
import { PORTFOLIO_HISTORY_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioHistoryQueryOptions'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'
import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
export function useCachedDashboardSources() {
  return [
    useCachedDashboardDataQuery(),
    useCachedPortfolioSourceQuery<PortfolioHistoryPoint[]>(
      PORTFOLIO_HISTORY_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<RawPositionRow[]>(
      PORTFOLIO_POSITIONS_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<PipelineError[]>(
      PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<ManualPriceOverride[]>(
      PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<MonthlyOperationsByMonth>(
      portfolioQueryKeys.data('monthly-operations'),
    ),
    useCachedPortfolioSourceQuery<RawIsinRows>(
      PORTFOLIO_ALLOCATION_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<FundHoldingsData>(
      PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey,
    ),
    useCachedPortfolioSourceQuery<FundDiagnostics>(
      portfolioQueryKeys.data('fund-diagnostics'),
    ),
    useCachedPortfolioSourceQuery<AnnualIncomeSavingsPoint[]>(
      portfolioQueryKeys.data('annual-income-savings'),
    ),
  ] as const
}
