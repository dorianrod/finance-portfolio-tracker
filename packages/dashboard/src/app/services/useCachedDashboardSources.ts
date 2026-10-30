import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
export function useCachedDashboardSources() {
  return [
    useCachedPortfolioSourceQuery<DashboardData>(
      portfolioQueryKeys.data('dashboard'),
    ),
    useCachedPortfolioSourceQuery<PortfolioHistoryPoint[]>(
      portfolioQueryKeys.data('portfolio-history'),
    ),
    useCachedPortfolioSourceQuery<CashHistoryPoint[]>(
      portfolioQueryKeys.data('cash-history'),
    ),
    useCachedPortfolioSourceQuery<RawPositionRow[]>(
      portfolioQueryKeys.data('all-positions'),
    ),
    useCachedPortfolioSourceQuery<PipelineError[]>(
      portfolioQueryKeys.data('pipeline-errors'),
    ),
    useCachedPortfolioSourceQuery<ManualPriceOverride[]>(
      portfolioQueryKeys.data('manual-price-overrides'),
    ),
    useCachedPortfolioSourceQuery<MonthlyOperationsByMonth>(
      portfolioQueryKeys.data('monthly-operations'),
    ),
    useCachedPortfolioSourceQuery<RawIsinRows>(
      portfolioQueryKeys.data('raw-isin-allocation'),
    ),
    useCachedPortfolioSourceQuery<FundHoldingsData>(
      portfolioQueryKeys.data('fund-holdings'),
    ),
    useCachedPortfolioSourceQuery<FundDiagnostics>(
      portfolioQueryKeys.data('fund-diagnostics'),
    ),
    useCachedPortfolioSourceQuery<AnnualIncomeSavingsPoint[]>(
      portfolioQueryKeys.data('annual-income-savings'),
    ),
  ] as const
}
