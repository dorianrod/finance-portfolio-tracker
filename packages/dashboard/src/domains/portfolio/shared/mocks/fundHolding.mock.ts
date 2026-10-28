import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export function makeFundHolding(
  overrides: Partial<FundHolding> = {},
): FundHolding {
  return {
    parentIsin: 'FR0000000001',
    parentTicker: 'FUND',
    parentName: 'Example fund',
    holdingId: 'holding-1',
    holdingName: 'Example holding',
    issuerId: 'issuer-1',
    issuerName: 'Example issuer',
    weight: 1,
    sourceTier: 'A',
    sourceName: 'Official',
    holdingsDate: new Date('2026-10-18'),
    ...overrides,
  }
}
