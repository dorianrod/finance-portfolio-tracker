import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export type HistoricalSnapshot = {
  effectiveDate: Date
  // Historical imports may omit the original collection timestamp.
  capturedAt: Date | null
  holdings: HistoricalFundHolding[]
}
