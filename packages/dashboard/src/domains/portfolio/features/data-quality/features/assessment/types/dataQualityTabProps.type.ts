import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

export type DataQualityTabProps = {
  positions: PositionRow[]
  errors: PipelineError[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
  rawData: RawIsinData
}
