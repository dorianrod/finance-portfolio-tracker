import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export function historicalHolding(
  overrides: Partial<HistoricalFundHolding> = {},
): HistoricalFundHolding {
  return {
    parentIsin: 'ISIN-FUND',
    parentTicker: '',
    parentName: 'Example UCITS ETF',
    holdingId: 'ISIN-UNDERLYING',
    holdingName: 'Underlying Corp',
    issuerId: 'ISSUER-UNDERLYING',
    issuerName: 'Underlying Corp',
    weight: 0.6,
    sourceTier: 'A',
    sourceName: 'Official provider',
    holdingsDate: new Date('2025-01-31'),
    effectiveDate: new Date('2025-01-31'),
    historySnapshotId: '2025-01-31/ISIN-FUND/a',
    capturedAt: new Date('2025-02-01T10:00:00Z'),
    ...overrides,
  }
}
