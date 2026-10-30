import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

export function makeAccountAllocationData(): RawIsinData {
  return rawData({
    geo: rows('france', 'europe'),
    secteur: rows('technology', 'industry'),
    currency: rows('EUR', 'USD'),
    classe: rows('equity', 'equity'),
  })
}

function rows(firstCategory: string, secondCategory: string): RawIsinRow[] {
  return [
    {
      snapshot_date: new Date('2024-01-01'),
      account: 'PEA',
      account_type: 'Brokerage',
      isin: 'A',
      name: 'Asset A',
      values: { [firstCategory]: 10 },
    },
    {
      snapshot_date: new Date('2024-01-01'),
      account: 'CTO',
      account_type: 'Brokerage',
      isin: 'A',
      name: 'Asset A',
      values: { [secondCategory]: 20 },
    },
    {
      snapshot_date: new Date('2024-01-01'),
      account: 'CTO',
      account_type: 'Brokerage – Cash',
      isin: 'NC-Cash CTO',
      name: 'Cash CTO',
      values: { 'Not concerned': 5 },
    },
  ]
}
