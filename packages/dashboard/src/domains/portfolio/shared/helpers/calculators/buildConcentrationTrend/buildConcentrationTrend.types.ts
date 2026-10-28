import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export type HistoricalSnapshot = {
  effectiveDate: Date
  capturedAt: Date | null
  holdings: HistoricalFundHolding[]
}
