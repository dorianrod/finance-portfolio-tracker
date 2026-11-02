import type { CellContext } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'

import { usePositionPreviewActions } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/actions/usePositionPreviewActions'
import { UnderlyingStatusButton } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableCells/UnderlyingStatusButton.view'
import { statusForPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/statusForPosition'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreview.atoms'
import { getPositionAllocationKey } from '@/domains/portfolio/shared/helpers/transformers/getPositionAllocationKey'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { PieChartIcon } from '@/shared/ui/icons/PieChartIcon.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'

import { PositionBreakdownView } from './PositionBreakdown.view'

export function PositionBreakdownCell({
  row,
  table,
}: CellContext<TableRow, unknown>) {
  const context = table.options.meta?.positionColumns
  const selection = useAtomValue(positionPreviewAtom)
  const { showPreview } = usePositionPreviewActions()
  if (!context) return null
  const { allocationData, fundStatusIndex, cancelHide, scheduleHide } = context
  const r = row.original
  if (r.kind !== 'position') return null
  const allocKey = getPositionAllocationKey(r)
  const allocation = allocationData.get(allocKey)
  const fundStatus = statusForPosition(r, fundStatusIndex)
  const showAllocation = (button: HTMLButtonElement) => {
    if (!allocation) return
    cancelHide()
    showPreview({
      kind: 'allocation',
      positionId: r.id,
      buttonRect: button.getBoundingClientRect(),
    })
  }
  const showUnderlying = (button: HTMLButtonElement) => {
    if (!fundStatus) return
    cancelHide()
    showPreview({
      kind: 'underlying',
      positionId: r.id,
      buttonRect: button.getBoundingClientRect(),
    })
  }
  return (
    <PositionBreakdownView
      hasAllocation={Boolean(allocation)}
      hasUnderlying={Boolean(fundStatus)}
    >
      <PositionBreakdownView.Slot available={Boolean(allocation)}>
        {allocation && (
          <Layout as="span" flow="control" sizing="fixed">
            <Preview.Trigger
              type="button"
              label={i18n.t('ui.positionstable.viewAllocationsForValue0', {
                value0: r.name,
              })}
              title={i18n.t('ui.positionstable.viewAssetAllocations')}
              variant="subtlePreview"
              onPreview={showAllocation}
              onDismiss={scheduleHide}
            >
              <PieChartIcon />
            </Preview.Trigger>
          </Layout>
        )}
      </PositionBreakdownView.Slot>
      <PositionBreakdownView.Slot available={Boolean(fundStatus)}>
        {fundStatus && (
          <UnderlyingStatusButton
            status={fundStatus}
            assetName={r.name}
            isOpen={
              selection?.kind === 'underlying' && selection.positionId === r.id
            }
            onShow={showUnderlying}
            onHide={scheduleHide}
          />
        )}
      </PositionBreakdownView.Slot>
    </PositionBreakdownView>
  )
}
