import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'

export function makeFundSnapshot(
  overrides: Partial<FundSnapshot> = {},
): FundSnapshot {
  return {
    fundId: 'FUND',
    fundName: 'Example fund',
    snapshotId: 'snapshot-1',
    snapshotDate: new Date('2026-10-18'),
    asOfDate: new Date('2026-10-18'),
    generatedAt: null,
    origin: 'official',
    status: 'active',
    isActive: true,
    isStale: false,
    ageDays: 0,
    holdingCount: 1,
    weightSum: 1,
    coveragePct: 100,
    complete: true,
    sourceUrls: [],
    evidencePath: '',
    holdingsPath: '',
    checksumSha256: '',
    notes: '',
    validationErrors: '',
    ...overrides,
  }
}
