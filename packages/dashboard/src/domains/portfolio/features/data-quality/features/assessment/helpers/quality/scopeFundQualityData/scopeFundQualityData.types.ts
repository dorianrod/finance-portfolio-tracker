import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

export type ScopedFundQualityData = {
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
  notApplicableValue: number
}

export type FundExposurePercentages = {
  identified: number
  unresolved: number
  notApplicable: number
}
