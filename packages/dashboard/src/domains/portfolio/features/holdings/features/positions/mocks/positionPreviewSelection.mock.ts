import type { PositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/types/positionPreviewSelection.type'

export function makePositionPreviewSelection(
  overrides: Partial<PositionPreviewSelection> = {},
): PositionPreviewSelection {
  return {
    kind: 'chart',
    positionId: 'asset-1',
    buttonRect: new DOMRect(10, 20, 30, 40),
    ...overrides,
  }
}
