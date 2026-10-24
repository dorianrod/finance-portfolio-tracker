import { useMemo, useState } from 'react'

import {
  buildPipelineErrorsViewModel,
  PIPELINE_ERROR_TYPE_LABELS,
  type PipelineErrorSortColumn,
} from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

const SOURCE_LABELS: Record<string, string> = {
  main: i18n.t('ui.errorstab.ingestPortfolioPy'),
  fetch_prices: i18n.t('ui.errorstab.fetchPricesPy'),
}

const ERROR_COLUMNS: [PipelineErrorSortColumn, string, string][] = [
  ['level', i18n.t('ui.errorstab.level'), 'w-20'],
  ['type', i18n.t('ui.errorstab.type'), 'w-40'],
  ['source', i18n.t('ui.errorstab.source'), 'w-28'],
  ['date', i18n.t('ui.errorstab.date'), 'w-24'],
  ['name', i18n.t('ui.errorstab.asset'), 'w-28'],
  ['isin', 'ISIN', 'w-24'],
  ['message', i18n.t('ui.errorstab.message'), ''],
]

type Props = {
  errors: PipelineError[]
}

function SortIcon({
  col,
  sortCol,
  dir,
}: {
  col: PipelineErrorSortColumn
  sortCol: PipelineErrorSortColumn
  dir: 'asc' | 'desc'
}) {
  if (col !== sortCol)
    return <span className="ml-1 text-content-subtle">↕</span>
  return (
    <span className="ml-1 text-content-muted">{dir === 'asc' ? '↑' : '↓'}</span>
  )
}

function ErrorTypeOption({ type }: { type: string }) {
  return (
    <option value={type}>{PIPELINE_ERROR_TYPE_LABELS[type] ?? type}</option>
  )
}

function ErrorColumnHeader({
  column,
  direction,
  onSort,
  sortColumn,
}: {
  column: (typeof ERROR_COLUMNS)[number]
  direction: 'asc' | 'desc'
  onSort: (column: PipelineErrorSortColumn) => void
  sortColumn: PipelineErrorSortColumn
}) {
  const [id, label, width] = column
  return (
    <th
      className={`px-3 py-2 text-left font-medium text-content-muted ${width} select-none`}
    >
      <button
        onClick={() => onSort(id)}
        className="flex cursor-pointer items-center transition-colors hover:text-content-secondary"
      >
        {label}
        <SortIcon col={id} sortCol={sortColumn} dir={direction} />
      </button>
    </th>
  )
}

type PipelineErrorRow = ReturnType<
  typeof buildPipelineErrorsViewModel
>['rows'][number]

function PipelineErrorTableRow({ error }: { error: PipelineErrorRow }) {
  const formatDate = useFormatDate()
  const formatAssetLabel = useFormatAssetLabel()
  return (
    <tr
      className={`border-b border-border/50 ${error.level === 'error' ? 'bg-danger-muted/20 hover:bg-danger-muted/30' : 'bg-warning-muted/10 hover:bg-warning-muted/20'}`}
    >
      <td className="px-3 py-2">
        <span
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${error.level === 'error' ? 'bg-danger-muted/60 text-danger' : 'bg-warning-muted/60 text-warning'}`}
        >
          {error.level === 'error'
            ? i18n.t('ui.errorstab.error.8af296')
            : i18n.t('ui.errorstab.warning.6270bb')}
        </span>
      </td>
      <td className="px-3 py-2 text-content-secondary">
        {PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type}
      </td>
      <td className="px-3 py-2 font-mono text-content-subtle">
        {SOURCE_LABELS[error.source] ?? error.source}
      </td>
      <td className="px-3 py-2 font-mono text-content-muted">
        {error.date ? formatDate(error.date, { style: 'isoDate' }) : '—'}
      </td>
      <td
        className="max-w-[7rem] truncate px-3 py-2 text-content-secondary"
        title={formatAssetLabel(error)}
      >
        {formatAssetLabel(error, '—')}
      </td>
      <td className="px-3 py-2 font-mono text-content-subtle">
        {error.isin || '—'}
      </td>
      <td className="px-3 py-2 leading-relaxed text-content-muted">
        {error.message}
      </td>
    </tr>
  )
}

export function ErrorsTab({ errors }: Props) {
  const formatAssetLabel = useFormatAssetLabel()
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warning'>(
    'all',
  )
  const [filterType, setFilterType] = useState<string>('all')
  const [sortCol, setSortCol] = useState<PipelineErrorSortColumn>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(col: PipelineErrorSortColumn) {
    if (col === sortCol) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const {
    errorCount,
    rows: filtered,
    types,
    warningCount,
  } = useMemo(
    () =>
      buildPipelineErrorsViewModel({
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
      {errors.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-content-muted">
              {i18n.t('ui.errorstab.detectedAnomalies', {
                count: errors.length,
              })}
            </span>
            {errorCount > 0 && (
              <span className="rounded-full border border-danger/50 bg-danger-muted/50 px-2.5 py-0.5 text-xs font-medium text-danger">
                {i18n.t('ui.errorstab.errorCount', { count: errorCount })}
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full border border-warning/50 bg-warning-muted/50 px-2.5 py-0.5 text-xs font-medium text-warning">
                {i18n.t('ui.errorstab.warningCount', { count: warningCount })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label={i18n.t('ui.errorstab.filterLevel')}
              value={filterLevel}
              onChange={(e) =>
                setFilterLevel(e.target.value as typeof filterLevel)
              }
              className="rounded border border-border-strong bg-surface-raised px-2 py-1 text-xs text-content-secondary focus:border-border-strong focus:outline-none"
            >
              <option value="all">{i18n.t('ui.errorstab.allLevels')}</option>
              <option value="error">{i18n.t('ui.errorstab.errorsOnly')}</option>
              <option value="warning">
                {i18n.t('ui.errorstab.warningsOnly')}
              </option>
            </select>
            <select
              aria-label={i18n.t('ui.errorstab.filterType')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded border border-border-strong bg-surface-raised px-2 py-1 text-xs text-content-secondary focus:border-border-strong focus:outline-none"
            >
              <option value="all">{i18n.t('ui.errorstab.allTypes')}</option>
              {types
                .filter((type) => type !== 'all')
                .map((type) => (
                  <ErrorTypeOption key={type} type={type} />
                ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilterLevel('all')
                  setFilterType('all')
                }}
                className="px-2 py-1 text-xs text-content-subtle hover:text-content-secondary"
              >
                {i18n.t('ui.errorstab.reset')}
              </button>
            )}
          </div>
        </>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {ERROR_COLUMNS.map((column) => (
                <ErrorColumnHeader
                  key={column[0]}
                  column={column}
                  direction={sortDir}
                  onSort={handleSort}
                  sortColumn={sortCol}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-content-subtle"
                >
                  {errors.length === 0
                    ? i18n.t('ui.errorstab.noPipelineAnomaliesDetected')
                    : i18n.t('ui.errorstab.noAnomaliesForThisFilter')}
                </td>
              </tr>
            ) : (
              filtered.map((error) => (
                <PipelineErrorTableRow key={error.id} error={error} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length < errors.length && (
        <p className="text-xs text-content-subtle text-right">
          {i18n.t('ui.errorstab.showingAnomalies', {
            shown: filtered.length,
            total: errors.length,
          })}
        </p>
      )}
    </div>
  )
}
