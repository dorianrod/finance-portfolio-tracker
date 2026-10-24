export type FundQualityTier = 'A' | 'B' | 'C' | 'D'
export type FundValidationStatus = 'ok' | 'warning' | 'error'

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
  holdingsDate: string
  holdingKind?: string
  lookthroughPath?: string
  depth?: number
  snapshotId?: string
  sourceOrigin?: string
  sourceUrl?: string
}

export type HistoricalFundHolding = FundHolding & {
  effectiveDate: string
  historySnapshotId: string
  capturedAt: string
}

export type FundHoldingStatus = {
  parentId: string
  parentIsin: string
  parentTicker: string
  parentName: string
  qualityTier: FundQualityTier
  validationStatus: FundValidationStatus
  sourceName: string
  sourceType: string
  sourceUrl: string
  indexName: string
  replicationMethod: string
  proxyName: string
  proxyIsin: string
  fetchedAt: string
  holdingsDate: string
  freshnessDays: number
  isStale: boolean
  holdingCount: number
  rawWeightSum: number
  explainedPct: number
  residualPct: number
  marketValue: number
  explainedValue: number
  residualValue: number
  refreshStreak: number
  issues: string
  decompositionState: 'resolved' | 'partial' | 'unresolved' | 'stale'
  snapshotId: string
  sourceOrigin: string
  manualAttention: boolean
  checksumSha256: string
}

export type FundSnapshot = {
  fundId: string
  fundName: string
  snapshotId: string
  snapshotDate: string
  asOfDate: string
  generatedAt: string
  origin: string
  status: string
  isActive: boolean
  isStale: boolean
  ageDays: number
  holdingCount: number
  weightSum: number
  coveragePct: number
  complete: boolean
  sourceUrls: string[]
  evidencePath: string
  holdingsPath: string
  checksumSha256: string
  notes: string
  validationErrors: string
}

export type FundUnresolved = {
  parentId: string
  parentName: string
  unresolvedId: string
  unresolvedName: string
  reason: string
  path: string
  weight: number
  marketValue: number
  queuedForResearch: boolean
  detectedAt: string
}

export type FundCoverageReport = {
  asOfDate: string
  portfolioValue: number
  fundValue: number
  directIdentifiedValue: number
  opaqueValue: number
  decomposedValue: number
  highConfidenceExplainedValue: number
  undisclosedFundValue: number
  fundCoveragePct: number
  portfolioCoveragePct: number
  coverageGatePass: boolean
  topFundsGatePass: boolean
  exactProxyGatePass: boolean
  repeatabilityGatePass: boolean
  feasibilityStatus: 'passed' | 'pending_repeatability' | 'limited'
  fundCount: number
  issueCount: number
}

export type FundHoldingsData = {
  holdings: FundHolding[]
  history: HistoricalFundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
}
