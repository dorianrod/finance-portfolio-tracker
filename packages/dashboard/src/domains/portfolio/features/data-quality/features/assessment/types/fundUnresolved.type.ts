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
  detectedAt: Date | null
}
