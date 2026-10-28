import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'

export function makeFundUnresolved(
  overrides: Partial<FundUnresolved> = {},
): FundUnresolved {
  return {
    parentId: 'FUND',
    parentName: 'Example fund',
    unresolvedId: 'unresolved-1',
    unresolvedName: 'Unidentified holding',
    reason: 'missing_identifier',
    path: '',
    weight: 0,
    marketValue: 0,
    queuedForResearch: false,
    detectedAt: null,
    ...overrides,
  }
}
