import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'

export function makeIsinAllocation(
  overrides: Partial<IsinAllocation> = {},
): IsinAllocation {
  return {
    isin: 'FR0000000001',
    name: 'Asset',
    geo: null,
    secteur: null,
    currency: null,
    classe: null,
    ...overrides,
  }
}
