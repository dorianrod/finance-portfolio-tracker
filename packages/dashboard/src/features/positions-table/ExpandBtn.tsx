import type { Row } from '@tanstack/react-table'
import type { TableRow } from '@/types/domain'

export function ExpandBtn({ row }: { row: Row<TableRow> }) {
  if (!row.getCanExpand()) return <span className="w-4 inline-block" />
  return (
    <button
      type="button"
      onClick={row.getToggleExpandedHandler()}
      aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
      aria-expanded={row.getIsExpanded()}
      className="grid size-6 place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
    >
      {row.getIsExpanded() ? '▾' : '▸'}
    </button>
  )
}
