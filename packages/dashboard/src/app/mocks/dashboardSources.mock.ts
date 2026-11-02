import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import { createManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/mocks/manualPriceOverride.mock'
import { pipelineError } from '@/domains/portfolio/features/data-quality/shared/mocks/pipelineError.mock'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { makeAnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/mocks/annualIncomeSavingsPoint.mock'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { makeFundHolding } from '@/domains/portfolio/shared/mocks/fundHolding.mock'
import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'
import { rawRow } from '@/domains/portfolio/shared/mocks/rawPositionRow.mock'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export function createDashboardSourceFixtures(): SourceFixtures {
  return {
    dashboard: {
      positions: [],
      rawPositions: [],
      rawOperations: [],
      accountLabels: { acc1: 'Account' },
    },
    history: [makePortfolioHistoryPoint()],
    positions: [rawRow({})],
    errors: [pipelineError({})],
    overrides: [createManualPriceOverride()],
    operations: new Map(),
    allocations: { geo: [], secteur: [], currency: [], classe: [] },
    funds: { holdings: [makeFundHolding()], history: [], statuses: [] },
    diagnostics: { report: null, snapshots: [], unresolved: [] },
    income: [makeAnnualIncomeSavingsPoint()],
  }
}
type SourceFixtures = {
  dashboard: DashboardData
  history: PortfolioHistoryPoint[]
  positions: RawPositionRow[]
  errors: PipelineError[]
  overrides: ManualPriceOverride[]
  operations: MonthlyOperationsByMonth
  allocations: RawIsinRows
  funds: FundHoldingsData
  diagnostics: FundDiagnostics
  income: AnnualIncomeSavingsPoint[]
}
