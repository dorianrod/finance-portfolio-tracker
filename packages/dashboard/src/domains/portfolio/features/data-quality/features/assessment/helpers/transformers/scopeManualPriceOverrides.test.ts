import { describe, expect, it } from 'vitest'

import { scopeManualPriceOverrides } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeManualPriceOverrides'
import { baseFilters } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import { position } from '@/domains/portfolio/shared/mocks/filteredPosition.mock'

describe('scopeManualPriceOverrides', () => {
  const override = {
    name: 'Asset',
    ticker: 'AAA',
    isin: 'FR1',
    price: 100,
    currency: 'EUR',
    date_from: new Date('2025-01-01'),
    date_to: null,
    source_file: 'manual.csv',
  }

  it('matches selected-account assets and overlapping dates', () => {
    const result = scopeManualPriceOverrides(
      [override, { ...override, name: 'Other', ticker: 'BBB', isin: 'FR2' }],
      [position({ name: 'Asset', ticker: 'AAA', isin: 'FR1' })],
      baseFilters({
        accounts: new Set(['acc1']),
        dateFrom: new Date('2026-01-01'),
        dateTo: new Date('2026-12-31'),
      }),
    )
    expect(result).toEqual([override])
  })

  it('excludes overrides ending before the selected period', () => {
    expect(
      scopeManualPriceOverrides(
        [{ ...override, date_to: new Date('2024-12-31') }],
        [position({ isin: 'FR1' })],
        baseFilters({ dateFrom: new Date('2025-01-01') }),
      ),
    ).toEqual([])
  })
})
