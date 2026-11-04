import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export function makeIssuerHolding(
  overrides: Partial<FundHolding>,
): FundHolding {
  return {
    parentIsin: 'FUND',
    parentTicker: '',
    parentName: 'World ETF',
    holdingId: 'SECURITY',
    holdingName: 'Company class A',
    issuerId: 'COMPANY',
    issuerName: 'Company',
    weight: 0.1,
    sourceTier: 'A',
    sourceName: 'Official',
    holdingsDate: new Date('2026-10-12'),
    ...overrides,
  }
}
