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
  sourceTier: FundQualityTier | ''
  sourceName: string
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
  capturedAt: Date | null
}
