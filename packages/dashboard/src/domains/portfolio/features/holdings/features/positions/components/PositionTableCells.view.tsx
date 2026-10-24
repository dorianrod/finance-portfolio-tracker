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

export type CellHandlers = React.HTMLAttributes<HTMLTableCellElement> | null

export function PositionBodyCell({
  cell,
  chartHandlers,
  savingsHandlers,
}: {
  cell: Cell<TableRow, unknown>
  chartHandlers: CellHandlers
  savingsHandlers: CellHandlers
}) {
  return (
    <td
      className="overflow-hidden px-3 py-2"
      {...(chartHandlers && cell.column.id === 'value' ? chartHandlers : {})}
      {...(savingsHandlers && cell.column.id === 'value'
        ? savingsHandlers
        : {})}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    reliable:
      'text-positive hover:bg-positive-muted/60 hover:text-positive focus-visible:ring-positive',
    partial:
      'text-warning hover:bg-warning-muted/60 hover:text-warning focus-visible:ring-warning',
    unavailable:
      'text-danger hover:bg-danger-muted/60 hover:text-danger focus-visible:ring-danger',
  }[category]

  return (
    <button
      type="button"
      aria-label={
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
      aria-expanded={isOpen}
      title={
        isOpen
          ? i18n.t('ui.positionstable.hideComposition', { title })
          : i18n.t('ui.positionstable.showComposition', { title })
      }
      className={`rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 ${tone} ${isOpen ? 'bg-surface-raised ring-1 ring-current/40' : ''}`}
      onMouseEnter={(event) => onShow(event.currentTarget)}
      onMouseLeave={onHide}
      onFocus={(event) => onShow(event.currentTarget)}
      onBlur={onHide}
      onClick={(event) => {
        event.stopPropagation()
        onShow(event.currentTarget)
      }}
    >
      <svg
        viewBox="0 0 20 20"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="7" y="2.25" width="6" height="4" rx="1" />
        <path
          d="M10 6.25v3.25M4.5 9.5h11M4.5 9.5v2.25M10 9.5v2.25M15.5 9.5v2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="2.25" y="11.75" width="4.5" height="4" rx="1" />
        <rect x="7.75" y="11.75" width="4.5" height="4" rx="1" />
        <rect x="13.25" y="11.75" width="4.5" height="4" rx="1" />
      </svg>
    </button>
  )
}
