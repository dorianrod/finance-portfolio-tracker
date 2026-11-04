import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export type DiversificationInputs = {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  rawData: RawIsinData
  dateFrom?: Date
  dateTo?: Date
}
