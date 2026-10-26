import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'

export const UNAVAILABLE_ASSET_IRR_SUMMARY: AssetIrrSummary = {
  available: false,
  start_date: null,
  end_date: null,
  assets: [],
}
