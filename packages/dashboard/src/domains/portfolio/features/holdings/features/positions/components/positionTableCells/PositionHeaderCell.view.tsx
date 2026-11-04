import { flexRender, type Header } from '@tanstack/react-table'

import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Inset } from '@/shared/ui/layout/Inset.view'

export function PositionHeaderCell({
  header,
}: {
  header: Header<TableRow, unknown>
}) {
  return (
    <Inset as="th" inset="tableCell">
      {flexRender(header.column.columnDef.header, header.getContext())}
    </Inset>
  )
}
