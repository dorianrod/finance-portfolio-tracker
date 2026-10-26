import type { Row } from '@tanstack/react-table'

import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { DisclosureButton } from '@/shared/ui/Controls.view'

export function ExpandBtn({ row }: { row: Row<TableRow> }) {
  if (!row.getCanExpand()) return <span className="w-4 inline-block" />
  return (
    <DisclosureButton
      type="button"
      onClick={row.getToggleExpandedHandler()}
      label={
        row.getIsExpanded()
          ? i18n.t('ui.expandbtn.collapseRow')
          : i18n.t('ui.expandbtn.expandRow')
      }
      expanded={row.getIsExpanded()}
      variant="rowDisclosure"
      className="grid size-6 place-items-center"
    >
      {row.getIsExpanded() ? '▾' : '▸'}
    </DisclosureButton>
  )
}
