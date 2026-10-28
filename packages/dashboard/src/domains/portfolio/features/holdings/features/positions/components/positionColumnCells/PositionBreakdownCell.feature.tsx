import { usePositionPreviewActions } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/actions/usePositionPreviewActions'
import { UnderlyingStatusControl } from '@/domains/portfolio/features/holdings/features/positions/components/UnderlyingStatusControl.feature'
import { statusForPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/statusForPosition'
import { getPositionAllocationKey } from '@/domains/portfolio/shared/helpers/mappers/getPositionAllocationKey'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { PieChartIcon } from '@/shared/ui/icons/PieChartIcon.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Surface } from '@/shared/ui/Surface.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Allocation and underlying previews share the same exclusive overlay protocol and table metadata.
export function PositionBreakdownCell({
  row,
  table,
}: import('@tanstack/react-table').CellContext<TableRow, unknown>) {
  const context = table.options.meta?.positionColumns
  const { showPreview } = usePositionPreviewActions()
  if (!context) return null
  const { allocationData, fundStatuses, cancelHide, scheduleHide } = context
  const r = row.original
  if (r.kind !== 'position') return null
  const allocKey = getPositionAllocationKey(r)
  const allocation = allocationData.get(allocKey)
  const fundStatus = statusForPosition(r, fundStatuses)
  const hasNoBreakdown = !allocation && !fundStatus
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
    <Grid as="span" columns={2} placement="inset" gap="compact">
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
      {!allocation && (
        <Layout as="span" flow="inline" width="icon" height="icon">
          <Decorative>
            <Layout as="span" flow="block"></Layout>
          </Decorative>
        </Layout>
      )}
      {fundStatus && (
        <UnderlyingStatusControl
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The table checks action availability; the control receives the matching API entity and owns only popover selection.
          status={fundStatus}
          assetName={r.name}
          positionId={r.id}
          onShow={showUnderlying}
          onHide={scheduleHide}
        />
      )}
      {!fundStatus && (
        <Layout as="span" flow="inline" width="icon" height="icon">
          <Decorative>
            <Layout as="span" flow="block"></Layout>
          </Decorative>
        </Layout>
      )}
      {hasNoBreakdown && (
        <Layout as="span" flow="block" placement="overlay">
          <Surface variant="overlay" as="span" tone="subtle">
            <Inline as="span" align="center" justify="center">
              —
            </Inline>
          </Surface>
        </Layout>
      )}
    </Grid>
  )
}
