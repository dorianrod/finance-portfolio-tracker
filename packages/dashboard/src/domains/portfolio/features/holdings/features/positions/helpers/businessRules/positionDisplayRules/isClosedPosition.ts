import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isClosedPosition(row: TableRow): boolean {
  return row.kind === 'position' && row.status === 'closed'
}
