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
  // eslint-disable-next-line complexity -- reviewed: 2026-10-27; Trade and savings group handlers share the same preview exclusivity, anchor and dismissal protocol.
  return useMemo(() => {
    const item = row.original
    const parent = row.getParentRow()?.original
    const isTradeGroup = item.kind === 'group' && item.groupType === 'trades'
    let chartHandlers: CellHandlers = null
    if (isTradeGroup && parent?.kind === 'position') {
      const positionKey = parent.isin || parent.ticker || parent.name
      if (positionKey)
        chartHandlers = {
          onPreview: (anchor) => {
            cancelHide()
            showPreview({
              kind: 'chart',
              positionId: parent.id,
              buttonRect: anchor.getBoundingClientRect(),
            })
          },
          onDismiss: scheduleHide,
        }
    }
    const isSavingsGroup = item.kind === 'group' && item.groupType === 'cash'
    let savingsHandlers: CellHandlers = null
    if (isSavingsGroup && parent?.kind === 'position')
      savingsHandlers = {
        onPreview: (anchor) => {
          cancelHide()
          showPreview({
            kind: 'savings',
            positionId: parent.id,
            buttonRect: anchor.getBoundingClientRect(),
          })
        },
        onDismiss: scheduleHide,
      }
    return { chartHandlers, savingsHandlers }
  }, [row, cancelHide, scheduleHide, showPreview])
}

type Input = { row: Row<TableRow> } & Pick<
  ReturnType<typeof usePositionTableOverlays>,
  'cancelHide' | 'scheduleHide'
>
