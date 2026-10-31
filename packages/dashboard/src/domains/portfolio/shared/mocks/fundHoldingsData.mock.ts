import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'

export function makeFundHoldingsData(
  overrides: Partial<FundHoldingsData> = {},
): FundHoldingsData {
  return { holdings: [], history: [], statuses: [], ...overrides }
}
