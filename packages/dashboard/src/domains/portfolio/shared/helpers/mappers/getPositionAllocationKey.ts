import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function getPositionAllocationKey(
  position: Pick<PositionRow, 'isin' | 'name'>,
): string {
  return position.isin || `NC-${position.name}`
}
