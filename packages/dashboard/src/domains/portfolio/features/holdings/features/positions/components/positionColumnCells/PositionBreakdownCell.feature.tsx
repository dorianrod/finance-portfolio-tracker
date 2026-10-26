import { UnderlyingStatusControl } from '@/domains/portfolio/features/holdings/features/positions/components/UnderlyingStatusControl.feature'
import { statusForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel/statusForPosition'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { PieChartIcon } from '@/shared/ui/icons/PieChartIcon.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Surface } from '@/shared/ui/Surface.view'

export function PositionBreakdownCell({
  row,
  table,
}: import('@tanstack/react-table').CellContext<TableRow, unknown>) {
  const context = table.options.meta?.positionColumns
  if (!context) return null
  const {
    allocationData,
    fundStatuses,
    cancelHide,
    scheduleHide,
    setAllocationHover,
    setChart,
    setSavingsChart,
    setUnderlyingPopover,
  } = context
  const r = row.original
  if (r.kind !== 'position') return null
  const allocKey = r.isin || `NC-${r.name}`
  const allocation = allocationData.get(allocKey)
  const fundStatus = statusForPosition(r, fundStatuses)
  const hasNoBreakdown = !allocation && !fundStatus
  const showAllocation = (button: HTMLButtonElement) => {
    if (!allocation) return
    cancelHide()
    setChart(null)
    setSavingsChart(null)
    setUnderlyingPopover(null)
    setAllocationHover({
      isin: allocKey,
      name: r.name,
      buttonRect: button.getBoundingClientRect(),
      allocation,
    })
  }
  const showUnderlying = (button: HTMLButtonElement) => {
    if (!fundStatus) return
    cancelHide()
    setChart(null)
    setSavingsChart(null)
    setAllocationHover(null)
    setUnderlyingPopover({
      position: r,
      status: fundStatus,
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
          // eslint-disable-next-line local/no-prop-drilling -- The table checks action availability; the control receives the matching API entity and owns only popover selection.
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
