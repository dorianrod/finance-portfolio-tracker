import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'

export function assetIrr(
  overrides: Partial<AssetIrrSummary> = {},
): AssetIrrSummary {
  return {
    available: true,
    start_date: new Date('2025-10-12'),
    end_date: new Date('2026-10-12'),
    assets: [
      {
        key: 'win',
        label: 'WIN',
        name: 'Winner',
        irr: 20,
        value: 1200,
        accounts: ['PEA'],
        account_types: ['PEA'],
      },
      {
        key: 'small',
        label: 'SMALL',
        name: 'Small winner',
        irr: 5,
        value: 525,
        accounts: ['CTO'],
        account_types: ['CTO'],
      },
      {
        key: 'lose',
        label: 'LOSE',
        name: 'Loser',
        irr: -10,
        value: 900,
        accounts: ['PEA'],
        account_types: ['PEA'],
      },
    ],
    ...overrides,
  }
}
