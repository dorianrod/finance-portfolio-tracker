import { type HeaderGroup } from '@tanstack/react-table'

import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { PositionHeaderCell } from './PositionHeaderCell.view'

export function PositionHeaderRow({ group }: { group: HeaderGroup<TableRow> }) {
  return (
    <tr>
      {group.headers.map((header) => (
        <PositionHeaderCell key={header.id} header={header} />
      ))}
    </tr>
  )
}
