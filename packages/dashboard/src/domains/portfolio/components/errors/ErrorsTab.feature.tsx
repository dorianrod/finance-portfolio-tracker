import { useMemo, useState } from 'react'
import { useFormatAssetLabel } from '@/domains/portfolio/helpers/formatters/useFormatAssetLabel'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import type { ErrorRow } from '@/domains/portfolio/apis/queries/useErrors'
import type { ManualPriceOverride } from '@/domains/portfolio/apis/queries/useManualPriceOverrides'
import {
  buildPipelineErrorsViewModel,
  PIPELINE_ERROR_TYPE_LABELS,
  type PipelineErrorSortColumn,
} from '@/domains/portfolio/helpers/mappers/buildPipelineErrorsViewModel'

const SOURCE_LABELS: Record<string, string> = {
  main:         'ingest_portfolio.py',
  fetch_prices: 'fetch_prices.py',
}

const ERROR_COLUMNS: [PipelineErrorSortColumn, string, string][] = [
  ['level', 'Level', 'w-20'], ['type', 'Type', 'w-40'], ['source', 'Source', 'w-28'], ['date', 'Date', 'w-24'], ['name', 'Asset', 'w-28'], ['isin', 'ISIN', 'w-24'], ['message', 'Message', ''],
]

interface Props {
  errors: ErrorRow[]
}

interface ManualPriceOverridesProps {
  manualPriceOverrides: ManualPriceOverride[]
}

function SortIcon({ col, sortCol, dir }: { col: PipelineErrorSortColumn; sortCol: PipelineErrorSortColumn; dir: 'asc' | 'desc' }) {
  if (col !== sortCol) return <span className="ml-1 text-gray-700">↕</span>
  return <span className="ml-1 text-gray-400">{dir === 'asc' ? '↑' : '↓'}</span>
}

function formatManualPrice(row: ManualPriceOverride, formatMoney: ReturnType<typeof useFormatMoney>): string {
  const price = Number(row.price)
  if (!Number.isFinite(price)) return `${row.price} ${row.currency}`.trim()
  try {
    return formatMoney(price, {
      currency: row.currency || 'EUR',
      maximumFractionDigits: 4,
    })
  } catch {
    return `${row.price} ${row.currency}`.trim()
  }
}

function ErrorTypeOption({ type }: { type: string }) {
  return <option value={type}>{PIPELINE_ERROR_TYPE_LABELS[type] ?? type}</option>
}

function ErrorColumnHeader({ column, direction, onSort, sortColumn }: { column: (typeof ERROR_COLUMNS)[number]; direction: 'asc' | 'desc'; onSort: (column: PipelineErrorSortColumn) => void; sortColumn: PipelineErrorSortColumn }) {
  const [id, label, width] = column
  return <th className={`px-3 py-2 text-left font-medium text-gray-400 ${width} select-none`}><button onClick={() => onSort(id)} className="flex cursor-pointer items-center transition-colors hover:text-gray-200">{label}<SortIcon col={id} sortCol={sortColumn} dir={direction} /></button></th>
}

type PipelineErrorRow = ReturnType<typeof buildPipelineErrorsViewModel>['rows'][number]

function PipelineErrorTableRow({ error }: { error: PipelineErrorRow }) {
  const formatAssetLabel = useFormatAssetLabel()
  return <tr className={`border-b border-gray-800/50 ${error.level === 'error' ? 'bg-red-950/20 hover:bg-red-950/30' : 'bg-yellow-950/10 hover:bg-yellow-950/20'}`}><td className="px-3 py-2"><span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${error.level === 'error' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-300'}`}>{error.level === 'error' ? '✕ Error' : '⚠ Warning'}</span></td><td className="px-3 py-2 text-gray-300">{PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type}</td><td className="px-3 py-2 font-mono text-gray-500">{SOURCE_LABELS[error.source] ?? error.source}</td><td className="px-3 py-2 font-mono text-gray-400">{error.date || '—'}</td><td className="max-w-[7rem] truncate px-3 py-2 text-gray-300" title={formatAssetLabel(error)}>{formatAssetLabel(error, '—')}</td><td className="px-3 py-2 font-mono text-gray-500">{error.isin || '—'}</td><td className="px-3 py-2 leading-relaxed text-gray-400">{error.message}</td></tr>
}

function ManualPriceOverrideRow({ row }: { row: ManualPriceOverride }) {
  const formatMoney = useFormatMoney()
  const openEnded = !row.date_to
  return <tr className="border-b border-gray-800/50 hover:bg-gray-900/40"><td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${openEnded ? 'bg-yellow-900/60 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>{openEnded ? 'Open-ended' : 'Bounded'}</span></td><td className="px-3 py-2 text-gray-300">{row.name || '—'}</td><td className="px-3 py-2 font-mono text-gray-500">{row.isin || row.ticker || '—'}</td><td className="px-3 py-2 font-medium text-gray-300">{formatManualPrice(row, formatMoney)}</td><td className="px-3 py-2 font-mono text-gray-400">{row.date_from || '—'}</td><td className="px-3 py-2 font-mono text-gray-400">{row.date_to || '—'}</td><td className="px-3 py-2 font-mono text-gray-500">{row.source_file}</td></tr>
}

export function ErrorsTab({ errors }: Props) {
  const formatAssetLabel = useFormatAssetLabel()
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warning'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortCol, setSortCol] = useState<PipelineErrorSortColumn>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(col: PipelineErrorSortColumn) {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const { errorCount, rows: filtered, types, warningCount } = useMemo(
    () => buildPipelineErrorsViewModel({
      errors,
      filterLevel,
      filterType,
      formatAssetLabel,
      sortColumn: sortCol,
      sortDirection: sortDir,
    }),
    [errors, filterLevel, filterType, formatAssetLabel, sortCol, sortDir],
  )

  return (
    <div className="space-y-4">
      {errors.length > 0 && <>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">
            {errors.length} anomal{errors.length > 1 ? 'ies' : 'y'} detected
          </span>
          {errorCount > 0 && (
            <span className="rounded-full border border-red-700/50 bg-red-900/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full border border-yellow-700/50 bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
              {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">All levels</option>
            <option value="error">Errors only</option>
            <option value="warning">Warnings only</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">All types</option>
            {types.filter((type) => type !== 'all').map((type) => <ErrorTypeOption key={type} type={type} />)}
          </select>
          {(filterLevel !== 'all' || filterType !== 'all') && (
            <button
              onClick={() => { setFilterLevel('all'); setFilterType('all') }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300"
            >
              Reset
            </button>
          )}
        </div>
      </>}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              {ERROR_COLUMNS.map((column) => <ErrorColumnHeader key={column[0]} column={column} direction={sortDir} onSort={handleSort} sortColumn={sortCol} />)}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {errors.length === 0 ? 'No pipeline anomalies detected' : 'No anomalies for this filter'}
                </td>
              </tr>
            ) : (
              filtered.map((error) => <PipelineErrorTableRow key={error.message} error={error} />)
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
  )
}

export function ManualPriceOverridesTable({ manualPriceOverrides }: ManualPriceOverridesProps) {
  return (
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
          ) : manualPriceOverrides.map((row) => <ManualPriceOverrideRow key={row.source_file} row={row} />)}
        </tbody>
      </table>
    </div>
  )
}
