import type { Row } from '@tanstack/react-table'
import type { TableRow } from '@/types/domain'

export function ExpandBtn({ row }: { row: Row<TableRow> }) {
  if (!row.getCanExpand()) return <span className="w-4 inline-block" />
  return (
    <button
      onClick={row.getToggleExpandedHandler()}
      className="w-4 text-gray-400 hover:text-white transition-colors"
    >
      {row.getIsExpanded() ? '▾' : '▸'}
    </button>
  )
}
