import type { Row } from '@tanstack/react-table'

import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { DisclosureButton } from '@/shared/ui/Controls.view'
import { Layout } from '@/shared/ui/Layout.view'

export function ExpandBtn({ row }: { row: Row<TableRow> }) {
  if (!row.getCanExpand())
    return <Layout as="span" flow="inline" width="icon" />
  return (
    <Layout as="span" flow="control" width="icon" height="icon">
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
      >
        {row.getIsExpanded() ? '▾' : '▸'}
      </DisclosureButton>
    </Layout>
  )
}
