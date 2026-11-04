import { makeFundHoldingStatus as baseFixture } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

export function status(
  overrides: Partial<FundHoldingStatus>,
): FundHoldingStatus {
  return baseFixture({
    parentId: 'FUND',
    parentIsin: 'FUND',
    parentTicker: '',
    parentName: 'World ETF',
    sourceName: 'Official',
    sourceUrl: '',
    fetchedAt: null,
    holdingsDate: null,
    marketValue: 1_000,
    explainedValue: 900,
    residualValue: 100,
    snapshotId: 'snapshot',
    ...overrides,
  })
}
