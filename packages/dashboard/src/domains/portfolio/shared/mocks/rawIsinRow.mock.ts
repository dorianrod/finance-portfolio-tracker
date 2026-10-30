import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

export function isinRow(overrides: Partial<RawIsinRow>): RawIsinRow {
  return {
    snapshot_date: new Date('2026-09-30'),
    isin: 'FR0000000000',
    name: 'Fund',
    values: { actions: 100 },
    ...overrides,
  }
}
