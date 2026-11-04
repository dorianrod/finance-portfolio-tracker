import type { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { usePositionPreviewActions } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/actions/usePositionPreviewActions'
import type { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/usePositionTableOverlays'
import type { CellHandlers } from '@/domains/portfolio/features/holdings/features/positions/types/positionCellHandlers.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function usePositionGroupPreviews({
  row,
  cancelHide,
  scheduleHide,
}: Input) {
  const { showPreview } = usePositionPreviewActions()
  return useMemo(() => {
    const target = groupPreviewTarget(row)
    let handlers: CellHandlers = null
    if (target) {
      handlers = {
        onPreview: (anchor) => {
          cancelHide()
          showPreview({
            kind: target.kind,
            positionId: target.positionId,
            buttonRect: anchor.getBoundingClientRect(),
          })
        },
        onDismiss: scheduleHide,
      }
    }
    return {
      chartHandlers: target?.kind === 'chart' ? handlers : null,
      savingsHandlers: target?.kind === 'savings' ? handlers : null,
    }
  }, [row, cancelHide, scheduleHide, showPreview])
}

type Input = { row: Row<TableRow> } & Pick<
  ReturnType<typeof usePositionTableOverlays>,
  'cancelHide' | 'scheduleHide'
>

function groupPreviewTarget(
  row: Row<TableRow>,
): { kind: 'chart' | 'savings'; positionId: string } | null {
  const item = row.original
  const parent = row.getParentRow()?.original
  if (item.kind !== 'group' || parent?.kind !== 'position') return null
  if (item.groupType === 'cash')
    return { kind: 'savings', positionId: parent.id }
  const positionKey = groupPositionKey(parent)
  if (item.groupType === 'trades' && positionKey)
    return { kind: 'chart', positionId: parent.id }
  return null
}

function groupPositionKey(position: Extract<TableRow, { kind: 'position' }>) {
  return position.isin || position.ticker || position.name
}
