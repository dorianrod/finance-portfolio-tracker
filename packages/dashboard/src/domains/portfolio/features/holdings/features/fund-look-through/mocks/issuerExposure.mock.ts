import type { IssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function makeIssuerExposure(
  overrides: Partial<IssuerExposure> = {},
): IssuerExposure {
  return {
    id: 'COMPANY',
    name: 'Company',
    value: 100,
    weight: 100,
    funds: ['World ETF'],
    sources: [{ fund: 'World ETF', value: 100 }],
    securities: [
      {
        id: 'CLASS-A',
        name: 'Company class A',
        value: 100,
        funds: ['World ETF'],
        sources: [{ fund: 'World ETF', value: 100 }],
      },
    ],
    ...overrides,
  }
}
