export type FundSnapshot = {
  fundId: string
  fundName: string
  snapshotId: string
  snapshotDate: Date
  asOfDate: Date
  // Imported evidence may omit its generation timestamp.
  generatedAt: Date | null
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
