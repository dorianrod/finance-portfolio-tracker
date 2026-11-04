import type { GroupRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function group(overrides: Partial<GroupRow>): GroupRow {
  return {
    kind: 'group',
    id: 'g1',
    groupType: 'trades',
    subRows: [],
    ...overrides,
  }
}
