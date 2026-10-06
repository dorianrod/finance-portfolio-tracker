import { useMemo, useState } from 'react'
import type { ErrorRow } from '@/hooks/useErrors'
import type { ManualPriceOverride } from '@/hooks/useManualPriceOverrides'

const TYPE_LABELS: Record<string, string> = {
  unresolved_ticker: 'Unresolved ticker',
  missing_price:     'Missing price',
  missing_fx_rate:   'Missing FX rate',
  parsing_error:     'Parsing error',
  missing_data:      'Missing data',
}

const SOURCE_LABELS: Record<string, string> = {
  main:         'ingest_portfolio.py',
  fetch_prices: 'fetch_prices.py',
}

type SortCol = 'level' | 'type' | 'source' | 'date' | 'name' | 'isin' | 'message'

interface Props {
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
}

function SortIcon({ col, sortCol, dir }: { col: SortCol; sortCol: SortCol; dir: 'asc' | 'desc' }) {
  if (col !== sortCol) return <span className="ml-1 text-gray-700">↕</span>
  return <span className="ml-1 text-gray-400">{dir === 'asc' ? '↑' : '↓'}</span>
}

function formatManualPrice(row: ManualPriceOverride): string {
  const price = Number(row.price)
  if (!Number.isFinite(price)) return `${row.price} ${row.currency}`.trim()
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: row.currency || 'EUR',
      maximumFractionDigits: 4,
    }).format(price)
  } catch {
    return `${row.price} ${row.currency}`.trim()
  }
}

export function ErrorsTab({ errors, manualPriceOverrides }: Props) {
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warning'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortCol, setSortCol] = useState<SortCol>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(col: SortCol) {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const types = useMemo(
    () => ['all', ...Array.from(new Set(errors.map((e) => e.type))).sort()],
    [errors]
  )

  const filtered = useMemo(() => {
    const rows = errors.filter((e) => {
      if (filterLevel !== 'all' && e.level !== filterLevel) return false
      if (filterType !== 'all' && e.type !== filterType) return false
      return true
    })

    return [...rows].sort((a, b) => {
      let va = ''
      let vb = ''
      switch (sortCol) {
        case 'level':   va = a.level;   vb = b.level;   break
        case 'type':    va = TYPE_LABELS[a.type] ?? a.type; vb = TYPE_LABELS[b.type] ?? b.type; break
        case 'source':  va = a.source;  vb = b.source;  break
        case 'date':    va = a.date;    vb = b.date;    break
        case 'name':    va = a.name || a.ticker; vb = b.name || b.ticker; break
        case 'isin':    va = a.isin;    vb = b.isin;    break
        case 'message': va = a.message; vb = b.message; break
      }
      const cmp = va.localeCompare(vb, 'en')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [errors, filterLevel, filterType, sortCol, sortDir])

  const errorCount   = errors.filter((e) => e.level === 'error').length
  const warningCount = errors.filter((e) => e.level === 'warning').length

  return (
    <div className="space-y-8">
      {errors.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-900/50 bg-green-950/10 px-4 py-3 text-gray-500">
          <svg className="w-7 h-7 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-300">No anomalies detected</p>
            <p className="text-xs mt-0.5">All data was loaded correctly.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-gray-400">
          {errors.length} anomal{errors.length > 1 ? 'ies' : 'y'} detected
        </span>
        {errorCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700/50">
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </span>
        )}
        {warningCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">
            {warningCount} warning{warningCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
          className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
        >
          <option value="all">All levels</option>
          <option value="error">Errors only</option>
          <option value="warning">Warnings only</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-500"
        >
          <option value="all">All types</option>
          {types.filter((t) => t !== 'all').map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
        {(filterLevel !== 'all' || filterType !== 'all') && (
          <button
            onClick={() => { setFilterLevel('all'); setFilterType('all') }}
            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              {(
                [
                  ['level',   'Level',   'w-20'],
                  ['type',    'Type',    'w-40'],
                  ['source',  'Source',  'w-28'],
                  ['date',    'Date',    'w-24'],
                  ['name',    'Asset',   'w-28'],
                  ['isin',    'ISIN',    'w-24'],
                  ['message', 'Message', ''],
                ] as [SortCol, string, string][]
              ).map(([col, label, width]) => (
                <th
                  key={col}
                  className={`text-left px-3 py-2 font-medium text-gray-400 ${width} select-none`}
                >
                  <button
                    onClick={() => handleSort(col)}
                    className="flex items-center hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    {label}
                    <SortIcon col={col} sortCol={sortCol} dir={sortDir} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No anomalies for this filter
                </td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-800/50 ${
                    e.level === 'error'
                      ? 'bg-red-950/20 hover:bg-red-950/30'
                      : 'bg-yellow-950/10 hover:bg-yellow-950/20'
                  }`}
                >
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        e.level === 'error'
                          ? 'bg-red-900/60 text-red-300'
                          : 'bg-yellow-900/60 text-yellow-300'
                      }`}
                    >
                      {e.level === 'error' ? '✕ Error' : '⚠ Warning'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {TYPE_LABELS[e.type] ?? e.type}
                  </td>
                  <td className="px-3 py-2 text-gray-500 font-mono">
                    {SOURCE_LABELS[e.source] ?? e.source}
                  </td>
                  <td className="px-3 py-2 text-gray-400 font-mono">
                    {e.date || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-300 truncate max-w-[7rem]" title={e.name || e.ticker}>
                    {e.name || e.ticker || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-500 font-mono">
                    {e.isin || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-400 leading-relaxed">
                    {e.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length < errors.length && (
        <p className="text-xs text-gray-600 text-right">
          Showing {filtered.length} / {errors.length} anomalies
        </p>
      )}
        </div>
      )}

      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-200">Manual price overrides</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-900/60 text-blue-300">
              {manualPriceOverrides.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Prices forced from asset_prices/others. Open-ended overrides replace automatic market prices until removed or given an end date.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/60 text-left text-gray-400">
                <th className="px-3 py-2 font-medium w-24">Status</th>
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium w-28">ISIN / Ticker</th>
                <th className="px-3 py-2 font-medium w-24">Forced price</th>
                <th className="px-3 py-2 font-medium w-24">From</th>
                <th className="px-3 py-2 font-medium w-24">Until</th>
                <th className="px-3 py-2 font-medium w-36">Source</th>
              </tr>
            </thead>
            <tbody>
              {manualPriceOverrides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No manual price overrides</td>
                </tr>
              ) : manualPriceOverrides.map((row, index) => {
                const openEnded = !row.date_to
                return (
                  <tr key={`${row.source_file}-${index}`} className="border-b border-gray-800/50 hover:bg-gray-900/40">
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        openEnded
                          ? 'bg-yellow-900/60 text-yellow-300'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {openEnded ? 'Open-ended' : 'Bounded'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-300">{row.name || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 font-mono">{row.isin || row.ticker || '—'}</td>
                    <td className="px-3 py-2 text-gray-300 font-medium">{formatManualPrice(row)}</td>
                    <td className="px-3 py-2 text-gray-400 font-mono">{row.date_from || '—'}</td>
                    <td className="px-3 py-2 text-gray-400 font-mono">{row.date_to || '—'}</td>
                    <td className="px-3 py-2 text-gray-500 font-mono">{row.source_file}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
