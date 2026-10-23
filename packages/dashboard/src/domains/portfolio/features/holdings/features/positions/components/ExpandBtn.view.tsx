import i18n from '@/i18n/i18n'
import type { Row } from '@tanstack/react-table'
import type { TableRow } from '@/domains/portfolio/shared/types/domain'

export function ExpandBtn({ row }: { row: Row<TableRow> }) {
  if (!row.getCanExpand()) return <span className="w-4 inline-block" />
  return (
    <button
      type="button"
      onClick={row.getToggleExpandedHandler()}
      aria-label={row.getIsExpanded() ? i18n.t('ui.expandbtn.collapseRow') : i18n.t('ui.expandbtn.expandRow')}
      aria-expanded={row.getIsExpanded()}
      className="grid size-6 place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
    >
      {row.getIsExpanded() ? '▾' : '▸'}
    </button>
  )
}
