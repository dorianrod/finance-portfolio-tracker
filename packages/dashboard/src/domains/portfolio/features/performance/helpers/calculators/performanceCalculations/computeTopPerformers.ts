import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { TopPerformer } from './performanceCalculations.types'

// Active positions with non-zero unrealized P&L, sorted best to worst.
export function computeTopPerformers(
  positions?: PositionRow[],
): TopPerformer[] {
  if (!positions) return []
  return positions
    .filter(
      (p) =>
        p.status === 'active' &&
        p.unrealized_gain_pct !== null &&
        p.unrealized_gain_pct !== 0,
    )
    .map((p) => ({
      label: resolveAssetName(p, p.isin),
      name: p.name,
      pct: Math.round(p.unrealized_gain_pct! * 10) / 10,
      gain: Math.round(p.unrealized_gain ?? 0),
      value: Math.round(p.total_value ?? 0),
      account_type: p.account_type ?? '',
    }))
    .toSorted((a, b) => b.pct - a.pct)
}
