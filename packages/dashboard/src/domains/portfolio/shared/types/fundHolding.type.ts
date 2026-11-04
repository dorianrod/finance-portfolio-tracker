export type FundQualityTier = 'A' | 'B' | 'C' | 'D'

export type FundHolding = {
  parentIsin: string
  parentTicker: string
  parentName: string
  holdingId: string
  holdingName: string
  issuerId: string
  issuerName: string
  weight: number
  // Descriptive source metadata; classification uses the status report's quality tier.
  sourceTier: string
  sourceName: string
  // Some composition sources do not disclose their holdings date.
  holdingsDate: Date | null
  holdingKind?: string
  lookthroughPath?: string
  depth?: number
  snapshotId?: string
  sourceOrigin?: string
  sourceUrl?: string
}

export type HistoricalFundHolding = FundHolding & {
  effectiveDate: Date
  historySnapshotId: string
  // Historical imports can lack the original collection timestamp.
  capturedAt: Date | null
}
