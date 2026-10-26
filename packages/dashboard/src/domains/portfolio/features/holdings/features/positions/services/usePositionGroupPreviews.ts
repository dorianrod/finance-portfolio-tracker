import type { Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import { getPositionSavingsOperations } from '@/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations/getPositionSavingsOperations'
import { getPositionTradeOperations } from '@/domains/portfolio/features/holdings/features/positions/helpers/mappers/getPositionChartOperations/getPositionTradeOperations'
import type { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays'
import type { CellHandlers } from '@/domains/portfolio/features/holdings/features/positions/types/positionCellHandlers.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function usePositionGroupPreviews({
  row,
  cancelHide,
  scheduleHide,
  setChart,
  setSavingsChart,
  setAllocationHover,
  setUnderlyingPopover,
}: Input) {
  // eslint-disable-next-line complexity -- Trade and savings group handlers share the same preview exclusivity, anchor and dismissal protocol.
  return useMemo(() => {
    const item = row.original
    const isTradeGroup = item.kind === 'group' && item.groupType === 'trades'
    let chartHandlers: CellHandlers = null
    if (isTradeGroup) {
      const parent = row.getParentRow()?.original
      if (parent?.kind === 'position') {
        const name = parent.name
        const positionKey = parent.isin || parent.ticker || name
        if (positionKey)
          chartHandlers = {
            onPreview: (anchor) => {
              cancelHide()
              setSavingsChart(null)
              setAllocationHover(null)
              setUnderlyingPopover(null)
              setChart({
                isin: positionKey,
                name,
                operations: getPositionTradeOperations(parent),
                buttonRect: anchor.getBoundingClientRect(),
              })
            },
            onDismiss: scheduleHide,
          }
      }
    }
    const isSavingsGroup = item.kind === 'group' && item.groupType === 'cash'
    let savingsHandlers: CellHandlers = null
    if (isSavingsGroup) {
      const parent = row.getParentRow()?.original
      if (parent?.kind === 'position')
        savingsHandlers = {
          onPreview: (anchor) => {
            cancelHide()
            setChart(null)
            setAllocationHover(null)
            setUnderlyingPopover(null)
            setSavingsChart({
              name: parent.name,
              operations: getPositionSavingsOperations(parent),
              buttonRect: anchor.getBoundingClientRect(),
            })
          },
          onDismiss: scheduleHide,
        }
    }
    return { chartHandlers, savingsHandlers }
  }, [
    row,
    cancelHide,
    scheduleHide,
    setChart,
    setSavingsChart,
    setAllocationHover,
    setUnderlyingPopover,
  ])
}

type Input = { row: Row<TableRow> } & Pick<
  ReturnType<typeof usePositionTableOverlays>,
  | 'cancelHide'
  | 'scheduleHide'
  | 'setChart'
  | 'setSavingsChart'
  | 'setAllocationHover'
  | 'setUnderlyingPopover'
>
