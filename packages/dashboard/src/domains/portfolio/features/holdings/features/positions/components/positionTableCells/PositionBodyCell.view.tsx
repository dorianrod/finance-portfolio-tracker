import { type Cell, flexRender } from '@tanstack/react-table'

import type { CellHandlers } from '@/domains/portfolio/features/holdings/features/positions/types/positionCellHandlers.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'

export function PositionBodyCell({
  cell,
  chartHandlers,
  savingsHandlers,
}: {
  cell: Cell<TableRow, unknown>
  chartHandlers: CellHandlers
  savingsHandlers: CellHandlers
}) {
  const handlers =
    cell.column.id === 'value' ? (chartHandlers ?? savingsHandlers) : null
  const content = flexRender(cell.column.columnDef.cell, cell.getContext())
  return (
    <Layout as="td" overflow="clip" inset="compact">
      {handlers ? (
        <Preview.Trigger {...handlers} variant="preview">
          {content}
        </Preview.Trigger>
      ) : (
        content
      )}
    </Layout>
  )
}
