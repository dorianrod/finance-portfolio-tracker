import i18n from '@/i18n/i18n'
import { useMemo, useState } from 'react'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import type { ErrorRow } from '@/domains/portfolio/shared/apis/queries/useErrors'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/apis/queries/useManualPriceOverrides'
import {
  buildPipelineErrorsViewModel,
  PIPELINE_ERROR_TYPE_LABELS,
  type PipelineErrorSortColumn,
} from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel'
import { formatManualPrice } from '@/domains/portfolio/features/data-quality/features/errors/helpers/formatters/formatManualPrice'

const SOURCE_LABELS: Record<string, string> = {
  main:         i18n.t('ui.errorstab.ingestPortfolioPy'),
  fetch_prices: i18n.t('ui.errorstab.fetchPricesPy'),
}

const ERROR_COLUMNS: [PipelineErrorSortColumn, string, string][] = [
  ['level', i18n.t('ui.errorstab.level'), 'w-20'], ['type', i18n.t('ui.errorstab.type'), 'w-40'], ['source', i18n.t('ui.errorstab.source'), 'w-28'], ['date', i18n.t('ui.errorstab.date'), 'w-24'], ['name', i18n.t('ui.errorstab.asset'), 'w-28'], ['isin', 'ISIN', 'w-24'], ['message', i18n.t('ui.errorstab.message'), ''],
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
  return <tr className={`border-b border-gray-800/50 ${error.level === 'error' ? 'bg-red-950/20 hover:bg-red-950/30' : 'bg-yellow-950/10 hover:bg-yellow-950/20'}`}><td className="px-3 py-2"><span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${error.level === 'error' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-300'}`}>{error.level === 'error' ? i18n.t('ui.errorstab.error.8af296') : i18n.t('ui.errorstab.warning.6270bb')}</span></td><td className="px-3 py-2 text-gray-300">{PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type}</td><td className="px-3 py-2 font-mono text-gray-500">{SOURCE_LABELS[error.source] ?? error.source}</td><td className="px-3 py-2 font-mono text-gray-400">{error.date || '—'}</td><td className="max-w-[7rem] truncate px-3 py-2 text-gray-300" title={formatAssetLabel(error)}>{formatAssetLabel(error, '—')}</td><td className="px-3 py-2 font-mono text-gray-500">{error.isin || '—'}</td><td className="px-3 py-2 leading-relaxed text-gray-400">{error.message}</td></tr>
}

function ManualPriceOverrideRow({ row }: { row: ManualPriceOverride }) {
  const formatMoney = useFormatMoney()
  const openEnded = !row.date_to
  return <tr className="border-b border-gray-800/50 hover:bg-gray-900/40"><td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${openEnded ? 'bg-yellow-900/60 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>{openEnded ? i18n.t('ui.errorstab.openEnded') : i18n.t('ui.errorstab.bounded')}</span></td><td className="px-3 py-2 text-gray-300">{row.name || '—'}</td><td className="px-3 py-2 font-mono text-gray-500">{row.isin || row.ticker || '—'}</td><td className="px-3 py-2 font-medium text-gray-300">{formatManualPrice(row, formatMoney)}</td><td className="px-3 py-2 font-mono text-gray-400">{row.date_from || '—'}</td><td className="px-3 py-2 font-mono text-gray-400">{row.date_to || '—'}</td><td className="px-3 py-2 font-mono text-gray-500">{row.source_file}</td></tr>
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
  const hasActiveFilters = filterLevel !== 'all' || filterType !== 'all'

  return (
    <div className="space-y-4">
      {errors.length > 0 && <>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">
            {errors.length}  {i18n.t('ui.errorstab.anomal')}{errors.length > 1 ? i18n.t('ui.errorstab.ies') : i18n.t('ui.errorstab.y')}  {i18n.t('ui.errorstab.detected')}
          </span>
          {errorCount > 0 && (
            <span className="rounded-full border border-red-700/50 bg-red-900/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
              {errorCount}  {i18n.t('ui.errorstab.error')}{errorCount > 1 ? i18n.t('ui.errorstab.s') : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full border border-yellow-700/50 bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
              {warningCount}  {i18n.t('ui.errorstab.warning')}{warningCount > 1 ? i18n.t('ui.errorstab.s') : ''}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as typeof filterLevel)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">{i18n.t('ui.errorstab.allLevels')}</option>
            <option value="error">{i18n.t('ui.errorstab.errorsOnly')}</option>
            <option value="warning">{i18n.t('ui.errorstab.warningsOnly')}</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-gray-500 focus:outline-none"
          >
            <option value="all">{i18n.t('ui.errorstab.allTypes')}</option>
            {types.filter((type) => type !== 'all').map((type) => <ErrorTypeOption key={type} type={type} />)}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setFilterLevel('all'); setFilterType('all') }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300"
            >

              {i18n.t('ui.errorstab.reset')}
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
                  {errors.length === 0 ? i18n.t('ui.errorstab.noPipelineAnomaliesDetected') : i18n.t('ui.errorstab.noAnomaliesForThisFilter')}
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

          {i18n.t('ui.errorstab.showing')} {filtered.length} / {errors.length}  {i18n.t('ui.errorstab.anomalies')}
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
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.status')}</th>
            <th className="px-3 py-2 font-medium">{i18n.t('ui.errorstab.asset')}</th>
            <th className="px-3 py-2 font-medium w-28">{i18n.t('ui.errorstab.isinTicker')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.forcedPrice')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.from')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.until')}</th>
            <th className="px-3 py-2 font-medium w-36">{i18n.t('ui.errorstab.source')}</th>
          </tr>
        </thead>
        <tbody>
          {manualPriceOverrides.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">{i18n.t('ui.errorstab.noManualPriceOverrides')}</td>
            </tr>
          ) : manualPriceOverrides.map((row) => <ManualPriceOverrideRow key={row.source_file} row={row} />)}
        </tbody>
      </table>
    </div>
  )
}
