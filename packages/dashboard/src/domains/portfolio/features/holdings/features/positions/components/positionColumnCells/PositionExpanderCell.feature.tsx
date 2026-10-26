import { type Row } from '@tanstack/react-table'

import { ExpandBtn } from '@/domains/portfolio/features/holdings/features/positions/components/ExpandBtn.view'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { TreeIndent } from '@/shared/ui/proportion/TreeIndent.view'

export function PositionExpanderCell({ row }: { row: Row<TableRow> }) {
  return (
    <TreeIndent depth={row.depth}>
      <ExpandBtn row={row} />
    </TreeIndent>
  )
}
