import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'

export function createManualPriceOverride(
  overrides: Partial<ManualPriceOverride> = {},
): ManualPriceOverride {
  return {
    name: 'Sample fund',
    ticker: '',
    isin: '',
    price: 125,
    currency: 'EUR',
    date_from: null,
    date_to: null,
    source_file: 'manual_prices.csv',
    ...overrides,
  }
}
