import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { fmtFull } from '@/shared/format/money'
import { DATA_TABLE_STYLES } from '@/shared/ui/tableStyles'
import { buildIssuerExposures, type IssuerExposure, type SecurityExposure } from './fundHoldings.logic'

const ROW_HEIGHT = 40
const GRID = 'grid grid-cols-[minmax(0,1fr)_140px_90px_minmax(0,220px)] items-center gap-x-4 px-4'

type ExposureRow =
  | { kind: 'issuer'; issuer: IssuerExposure; open: boolean }
  | { kind: 'security'; issuer: IssuerExposure; security: SecurityExposure }
  | { kind: 'source'; issuer: IssuerExposure; security: SecurityExposure; fund: string; value: number }

export function FundHoldingsExplorer({ positions, holdings, statuses, query, onQueryChange }: {
  positions: PositionRow[]
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  query: string
  onQueryChange: (query: string) => void
}) {
  const [sort, setSort] = useState<'value' | 'name'>('value')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const selectedFundName = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return ''
    return positions.find((position) => (
      position.name.toLocaleLowerCase() === needle
      && statuses.some((status) => (
        status.parentId === (position.isin || position.ticker)
        || (!!position.isin && status.parentIsin === position.isin)
        || (!!position.ticker && status.parentTicker === position.ticker)
      ))
    ))?.name ?? ''
  }, [positions, query, statuses])
  const exposures = useMemo(
    () => {
      if (!selectedFundName) return buildIssuerExposures(positions, holdings, statuses)
      const scopedPositions = positions.filter((position) => position.name === selectedFundName)
      const parentIds = new Set(scopedPositions.flatMap((position) => [position.isin, position.ticker]).filter(Boolean))
      const scopedHoldings = holdings.filter((holding) => (
        holding.parentName === selectedFundName
        || parentIds.has(holding.parentIsin)
        || parentIds.has(holding.parentTicker)
      ))
      return buildIssuerExposures(scopedPositions, scopedHoldings, statuses)
    },
    [positions, holdings, statuses, selectedFundName],
  )
  const displayed = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const filtered = needle && !selectedFundName ? exposures.filter((issuer) => (
      issuer.name.toLocaleLowerCase().includes(needle)
      || issuer.id.toLocaleLowerCase().includes(needle)
      || issuer.securities.some((security) => security.name.toLocaleLowerCase().includes(needle))
      || issuer.funds.some((fund) => fund.toLocaleLowerCase().includes(needle))
    )) : exposures
    return [...filtered].sort(sort === 'value'
      ? (a, b) => b.value - a.value
      : (a, b) => a.name.localeCompare(b.name))
  }, [exposures, query, selectedFundName, sort])

  const securityCount = useMemo(
    () => displayed.reduce((sum, issuer) => sum + issuer.securities.length, 0),
    [displayed],
  )
  const rows = useMemo<ExposureRow[]>(() => displayed.flatMap((issuer) => [
    { kind: 'issuer' as const, issuer, open: expanded.has(issuer.id) },
    ...(expanded.has(issuer.id)
      ? issuer.securities.flatMap((security): ExposureRow[] => [
        { kind: 'security', issuer, security },
        // One line per source fund when a security is held through several.
        ...(security.sources.length > 1
          ? security.sources.map((source) => ({ kind: 'source' as const, issuer, security, fund: source.fund, value: source.value }))
          : []),
      ])
      : []),
  ]), [displayed, expanded])
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  useLayoutEffect(() => {
    const measure = () => {
      if (listRef.current) setScrollMargin(listRef.current.getBoundingClientRect().top + window.scrollY)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    scrollMargin,
  })

  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <section className={DATA_TABLE_STYLES.panel}>
      <div className={DATA_TABLE_STYLES.toolbar}>
        <div>
          <h2 className={DATA_TABLE_STYLES.title}>All identified economic exposure</h2>
          <p className={DATA_TABLE_STYLES.description}>Grouped by issuer, with security and source-fund detail underneath. Percentages use the whole selected portfolio.</p>
        </div>
        <div className={DATA_TABLE_STYLES.actions}>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search issuer, security or fund"
            aria-label="Search underlying assets"
            className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-600 sm:w-72"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as 'value' | 'name')}
            aria-label="Sort underlying assets"
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-300"
          >
            <option value="value">Largest first</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      <div>
        <div>
          <div className={`${GRID} ${DATA_TABLE_STYLES.columnHeader} py-2`}>
            <span>Issuer</span><span className="text-right">Exposure</span><span className="text-right">Portfolio</span><span>Sources</span>
          </div>
          <div ref={listRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index]
              return (
                <div
                  key={rowKey(row)}
                  className="absolute left-0 top-0 w-full"
                  style={{ height: item.size, transform: `translateY(${item.start - scrollMargin}px)` }}
                >
                  {row.kind === 'issuer' && <IssuerRow issuer={row.issuer} open={row.open} onToggle={toggle} />}
                  {row.kind === 'security' && <SecurityRow security={row.security} />}
                  {row.kind === 'source' && <SourceRow fund={row.fund} value={row.value} />}
                </div>
              )
            })}
          </div>
        </div>
        {displayed.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No exposure matches this search.</p>}
      </div>
      <div className="sticky bottom-0 z-10 rounded-b-xl border-t border-gray-800 bg-gray-900 px-4 py-2 text-xs text-gray-400">
        {displayed.length.toLocaleString()} issuers · {securityCount.toLocaleString()} securities
        {displayed.length !== exposures.length && <span className="text-gray-600"> (filtered from {exposures.length.toLocaleString()} issuers)</span>}
      </div>
    </section>
  )
}

type Source = { fund: string; value: number }

/** Single fund: plain name. Several: "N funds" with a breakdown tooltip. */
function SourcesCell({ sources, total, empty, className }: {
  sources: Source[]
  total: number
  empty: string
  className: string
}) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  if (sources.length <= 1) {
    return <span className={`truncate ${className}`} title={sources[0]?.fund}>{sources[0]?.fund ?? empty}</span>
  }
  return (
    <span
      tabIndex={0}
      onMouseEnter={(event) => setAnchor(event.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setAnchor(null)}
      onFocus={(event) => setAnchor(event.currentTarget.getBoundingClientRect())}
      onBlur={() => setAnchor(null)}
      className={`w-fit cursor-help truncate underline decoration-dotted decoration-gray-600 underline-offset-4 ${className}`}
    >
      {sources.length} funds
      {anchor && createPortal(<SourcesTooltip anchor={anchor} sources={sources} total={total} />, document.body)}
    </span>
  )
}

const TOOLTIP_WIDTH = 340

function SourcesTooltip({ anchor, sources, total }: { anchor: DOMRect; sources: Source[]; total: number }) {
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - TOOLTIP_WIDTH - 8))
  const below = anchor.bottom + 8 + 40 + sources.length * 24 < window.innerHeight
  const position = below ? { top: anchor.bottom + 6 } : { bottom: window.innerHeight - anchor.top + 6 }
  return (
    <div
      role="tooltip"
      style={{ left, width: TOOLTIP_WIDTH, ...position }}
      className="pointer-events-none fixed z-50 rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs shadow-xl"
    >
      <div className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">Held through {sources.length} funds</div>
      <ul className="max-h-64 space-y-1 overflow-hidden">
        {sources.map((source) => (
          <li key={source.fund} className="flex items-baseline gap-3">
            <span className="min-w-0 flex-1 truncate text-gray-300">{source.fund}</span>
            <span className="tabular-nums text-gray-400">{fmtFull(source.value)}</span>
            <span className="w-12 text-right tabular-nums text-gray-600">{total > 0 ? (source.value / total * 100).toFixed(0) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function rowKey(row: ExposureRow): string {
  if (row.kind === 'issuer') return row.issuer.id
  if (row.kind === 'security') return `${row.issuer.id}|${row.security.id}`
  return `${row.issuer.id}|${row.security.id}|${row.fund}`
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-gray-500">
      <path d={open ? 'M5 8l5 5 5-5' : 'M8 5l5 5-5 5'} />
    </svg>
  )
}

const IssuerRow = memo(function IssuerRow({ issuer, open, onToggle }: {
  issuer: IssuerExposure
  open: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div className={`${GRID} h-full border-b border-gray-800 text-sm hover:bg-gray-800/60`}>
      <button
        type="button"
        onClick={() => onToggle(issuer.id)}
        aria-expanded={open}
        className="flex min-w-0 items-center gap-2 text-left"
      >
        <Chevron open={open} />
        <span className="truncate font-medium text-gray-100">{issuer.name}</span>
        <span className="font-mono text-[10px] text-gray-600">{issuer.id}</span>
      </button>
      <span className="text-right font-medium tabular-nums text-gray-200">{fmtFull(issuer.value)}</span>
      <span className="text-right tabular-nums text-gray-400">{issuer.weight.toFixed(2)}%</span>
      <SourcesCell sources={issuer.sources} total={issuer.value} empty="Direct" className="text-xs text-gray-500" />
    </div>
  )
})

const SecurityRow = memo(function SecurityRow({ security }: { security: SecurityExposure }) {
  const [single] = security.funds
  return (
    <div className={`${GRID} h-full border-b border-gray-900 bg-gray-950/50 text-xs`}>
      <span className="min-w-0 truncate pl-6"><span className="text-gray-300">{security.name}</span><span className="ml-2 font-mono text-[10px] text-gray-700">{security.id}</span></span>
      <span className="text-right tabular-nums text-gray-400">{fmtFull(security.value)}</span>
      <span />
      {security.funds.length <= 1
        ? <span className="truncate text-gray-500" title={single}>{single ?? 'Direct holding'}</span>
        : <SourcesCell sources={security.sources} total={security.value} empty="Direct holding" className="text-gray-600" />}
    </div>
  )
})

const SourceRow = memo(function SourceRow({ fund, value }: { fund: string; value: number }) {
  return (
    <div className={`${GRID} h-full border-b border-gray-900 bg-gray-950/50 text-xs`}>
      <span />
      <span className="text-right tabular-nums text-gray-500">{fmtFull(value)}</span>
      <span />
      <span className="truncate text-gray-500" title={fund}>{fund}</span>
    </div>
  )
})
