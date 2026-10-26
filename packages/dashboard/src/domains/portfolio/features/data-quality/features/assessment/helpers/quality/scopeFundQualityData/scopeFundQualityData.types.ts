import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'

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
