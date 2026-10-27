import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

export type FundValidationStatus = 'ok' | 'warning' | 'error'

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
  fetchedAt: Date | null
  holdingsDate: Date | null
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
