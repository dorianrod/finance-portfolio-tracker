import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'

import type { FundHoldingStatus } from './fundHoldingStatus.type'

export type FundHoldingsData = {
  holdings: FundHolding[]
  history: HistoricalFundHolding[]
  statuses: FundHoldingStatus[]
}
