import type { AssetIrrItem } from '@/domains/portfolio/features/performance/types/assetIrr.type'

export function getIrrListScale(items: AssetIrrItem[]): number {
  return items.reduce(
    (maximum, item) => Math.max(maximum, Math.abs(item.irr)),
    0,
  )
}
