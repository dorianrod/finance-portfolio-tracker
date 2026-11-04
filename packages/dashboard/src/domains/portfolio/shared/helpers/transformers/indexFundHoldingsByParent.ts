import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export function indexFundHoldingsByParent(
  holdings: readonly FundHolding[],
): Map<string, FundHolding[]> {
  const byParent = new Map<string, FundHolding[]>()
  for (const holding of holdings) {
    for (const key of new Set(
      [holding.parentIsin, holding.parentTicker].filter(Boolean),
    )) {
      const rows = byParent.get(key) ?? []
      rows.push(holding)
      byParent.set(key, rows)
    }
  }
  return byParent
}
