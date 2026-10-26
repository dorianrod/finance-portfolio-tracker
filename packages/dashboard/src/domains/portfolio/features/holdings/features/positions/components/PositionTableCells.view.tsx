import {
  type Cell,
  flexRender,
  type Header,
  type HeaderGroup,
} from '@tanstack/react-table'

import {
  FUND_QUALITY_LABELS,
  getFundQualityPresentation,
} from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { HierarchyIcon } from '@/shared/ui/Icons.view'
import { Preview } from '@/shared/ui/Preview.view'

export function PositionHeaderCell({
  header,
}: {
  header: Header<TableRow, unknown>
}) {
  return (
    <th className="px-3 py-2">
      {flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  )
}

export function PositionHeaderRow({ group }: { group: HeaderGroup<TableRow> }) {
  return (
    <tr>
      {group.headers.map((header) => (
        <PositionHeaderCell key={header.id} header={header} />
      ))}
    </tr>
  )
}

export type CellHandlers = {
  onPreview: (anchor: HTMLButtonElement) => void
  onDismiss: () => void
} | null

export function PositionBodyCell({
  cell,
  chartHandlers,
  savingsHandlers,
}: {
  cell: Cell<TableRow, unknown>
  chartHandlers: CellHandlers
  savingsHandlers: CellHandlers
}) {
  const handlers =
    cell.column.id === 'value' ? (chartHandlers ?? savingsHandlers) : null
  const content = flexRender(cell.column.columnDef.cell, cell.getContext())
  return (
    <td className="overflow-hidden px-3 py-2">
      {handlers ? (
        <Preview.Trigger {...handlers} variant="preview">
          {content}
        </Preview.Trigger>
      ) : (
        content
      )}
    </td>
  )
}

export function UnderlyingStatusButton({
  status,
  assetName,
  isOpen,
  onShow,
  onHide,
}: {
  status: FundHoldingStatus
  assetName: string
  isOpen: boolean
  onShow: (button: HTMLButtonElement) => void
  onHide: () => void
}) {
  const formatPercentage = useFormatPercentage()
  const { category, sourceLabel } = getFundQualityPresentation(
    status.qualityTier,
  )
  const label = FUND_QUALITY_LABELS[category]
  const title = i18n.t('ui.positionstable.fundQualitySummary', {
    label,
    source: sourceLabel,
    percentage: formatPercentage(status.explainedPct, { unit: ' %' }),
  })
  const tone = {
    reliable: 'positive',
    partial: 'warning',
    unavailable: 'negative',
  }[category] as 'positive' | 'warning' | 'negative'

  return (
    <Preview.Trigger
      type="button"
      label={
        isOpen
          ? i18n.t('ui.positionstable.hideCompositionForAsset', {
              title,
              assetName,
            })
          : i18n.t('ui.positionstable.showCompositionForAsset', {
              title,
              assetName,
            })
      }
      expanded={isOpen}
      title={
        isOpen
          ? i18n.t('ui.positionstable.hideComposition', { title })
          : i18n.t('ui.positionstable.showComposition', { title })
      }
      tone={tone}
      selected={isOpen}
      className="p-1.5"
      onPreview={onShow}
      onDismiss={onHide}
    >
      <HierarchyIcon />
    </Preview.Trigger>
  )
}
