import type { ExposureRow } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'
import type {
  IssuerExposure,
  SecurityExposure,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'

export const GRID =
  'grid grid-cols-[minmax(0,1fr)_140px_90px_minmax(0,220px)] items-center gap-x-4 px-4'

export type VirtualExposureItem = { index: number; size: number; start: number }

export function VirtualExposureRow({
  item,
  onToggle,
  row,
  scrollMargin,
}: {
  item: VirtualExposureItem
  onToggle: (id: string) => void
  row: ExposureRow
  scrollMargin: number
}) {
  return (
    <div
      className="absolute left-0 top-0 w-full"
      style={{ height: item.size, transform: `translateY(${item.start - scrollMargin}px)` }}
    >
      {row.kind === 'issuer' && (
        <IssuerRow issuer={row.issuer} open={row.open} onToggle={onToggle} />
      )}
      {row.kind === 'security' && <SecurityRow security={row.security} />}
      {row.kind === 'source' && <SourceRow fund={row.fund} value={row.value} />}
    </div>
  )
}

export type Source = { fund: string; value: number }

export function SourcesCell({
  sources,
  total,
  empty,
  className,
}: {
  sources: Source[]
  total: number
  empty: string
  className: string
}) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  if (sources.length <= 1) {
    return (
      <span className={`truncate ${className}`} title={sources[0]?.fund}>
        {sources[0]?.fund ?? empty}
      </span>
    )
  }
  return (
    <span
      tabIndex={0}
      onMouseEnter={(event) => setAnchor(event.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setAnchor(null)}
      onFocus={(event) => setAnchor(event.currentTarget.getBoundingClientRect())}
      onBlur={() => setAnchor(null)}
      className={`w-fit cursor-help truncate underline decoration-dotted decoration-border-strong underline-offset-4 ${className}`}
    >
      {sources.length} {i18n.t('ui.fundholdingsexplorer.funds')}
      {anchor &&
        createPortal(
          <SourcesTooltip anchor={anchor} sources={sources} total={total} />,
          document.body,
        )}
    </span>
  )
}

export const TOOLTIP_WIDTH = 340

export function SourceTooltipRow({ source, total }: { source: Source; total: number }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <li className="flex items-baseline gap-3">
      <span className="min-w-0 flex-1 truncate text-content-secondary">{source.fund}</span>
      <span className="tabular-nums text-content-muted">
        {formatMoney(source.value, { style: 'full' })}
      </span>
      <span className="w-12 text-right tabular-nums text-content-subtle">
        {formatPercentage(total > 0 ? (source.value / total) * 100 : 0, { decimals: 0 })}
      </span>
    </li>
  )
}

export function SourcesTooltip({
  anchor,
  sources,
  total,
}: {
  anchor: DOMRect
  sources: Source[]
  total: number
}) {
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - TOOLTIP_WIDTH - 8))
  const below = anchor.bottom + 8 + 40 + sources.length * 24 < window.innerHeight
  const position = below
    ? { top: anchor.bottom + 6 }
    : { bottom: window.innerHeight - anchor.top + 6 }
  return (
    <div
      role="tooltip"
      style={{ left, width: TOOLTIP_WIDTH, ...position }}
      className="pointer-events-none fixed z-50 rounded-lg border border-border-strong bg-canvas p-3 text-xs shadow-xl"
    >
      <div className="mb-2 text-[10px] uppercase tracking-wider text-content-subtle">
        {i18n.t('ui.fundholdingsexplorer.heldThrough')} {sources.length}{' '}
        {i18n.t('ui.fundholdingsexplorer.funds')}
      </div>
      <ul className="max-h-64 space-y-1 overflow-hidden">
        {sources.map((source) => (
          <SourceTooltipRow key={source.fund} source={source} total={total} />
        ))}
      </ul>
    </div>
  )
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-content-subtle"
    >
      <path d={open ? 'M5 8l5 5 5-5' : 'M8 5l5 5-5 5'} />
    </svg>
  )
}

export const IssuerRow = memo(function IssuerRow({
  issuer,
  open,
  onToggle,
}: {
  issuer: IssuerExposure
  open: boolean
  onToggle: (id: string) => void
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <div className={`${GRID} h-full border-b border-border text-sm hover:bg-surface-raised/60`}>
      <button
        type="button"
        onClick={() => onToggle(issuer.id)}
        aria-expanded={open}
        className="flex min-w-0 items-center gap-2 text-left"
      >
        <Chevron open={open} />
        <span className="truncate font-medium text-content">{issuer.name}</span>
        <span className="font-mono text-[10px] text-content-subtle">{issuer.id}</span>
      </button>
      <span className="text-right font-medium tabular-nums text-content-secondary">
        {formatMoney(issuer.value, { style: 'full' })}
      </span>
      <span className="text-right tabular-nums text-content-muted">
        {formatPercentage(issuer.weight, { decimals: 2 })}
      </span>

      <SourcesCell
        sources={issuer.sources}
        total={issuer.value}
        empty={i18n.t('ui.fundholdingsexplorer.direct')}
        className="text-xs text-content-subtle"
      />
    </div>
  )
})

export const SecurityRow = memo(function SecurityRow({ security }: { security: SecurityExposure }) {
  const formatMoney = useFormatMoney()
  const [single] = security.funds
  return (
    <div className={`${GRID} h-full border-b border-border bg-canvas/50 text-xs`}>
      <span className="min-w-0 truncate pl-6">
        <span className="text-content-secondary">{security.name}</span>
        <span className="ml-2 font-mono text-[10px] text-content-subtle">{security.id}</span>
      </span>
      <span className="text-right tabular-nums text-content-muted">
        {formatMoney(security.value, { style: 'full' })}
      </span>
      <span />
      {security.funds.length <= 1 ? (
        <span className="truncate text-content-subtle" title={single}>
          {single ?? i18n.t('ui.fundholdingsexplorer.directHolding')}
        </span>
      ) : (
        <SourcesCell
          sources={security.sources}
          total={security.value}
          empty={i18n.t('ui.fundholdingsexplorer.directHolding')}
          className="text-content-subtle"
        />
      )}
    </div>
  )
})

export const SourceRow = memo(function SourceRow({ fund, value }: { fund: string; value: number }) {
  const formatMoney = useFormatMoney()
  return (
    <div className={`${GRID} h-full border-b border-border bg-canvas/50 text-xs`}>
      <span />
      <span className="text-right tabular-nums text-content-subtle">
        {formatMoney(value, { style: 'full' })}
      </span>
      <span />
      <span className="truncate text-content-subtle" title={fund}>
        {fund}
      </span>
    </div>
  )
})
