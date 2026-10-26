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
import { Button } from '@/shared/ui/Controls.view'
import { Select } from '@/shared/ui/Controls.view'
import { Inline, Inset, Layout, Stack } from '@/shared/ui/Layout.view'
import { LevelBadge, StatusTableRow } from '@/shared/ui/StatusBadge.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

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
    <Stack gap="relaxed">
      {errors.length > 0 && (
        <>
          <Inline as="div" flow="wrap" align="center" gap="default">
            <Text variant="body" tone="muted">
              {i18n.t('ui.errorstab.detectedAnomalies', {
                count: errors.length,
              })}
            </Text>
            {errorCount > 0 && (
              <Surface variant="errorCount" as="span" tone="negative">
                {i18n.t('ui.errorstab.errorCount', { count: errorCount })}
              </Surface>
            )}
            {warningCount > 0 && (
              <Surface variant="warningCount" as="span" tone="warning">
                {i18n.t('ui.errorstab.warningCount', { count: warningCount })}
              </Surface>
            )}
          </Inline>

          <Inline as="div" flow="wrap" gap="default">
            <Select
              label={i18n.t('ui.errorstab.filterLevel')}
              value={filterLevel}
              onChange={(e) =>
                setFilterLevel(e.target.value as typeof filterLevel)
              }
              variant="compact"
            >
              <option value="all">{i18n.t('ui.errorstab.allLevels')}</option>
              <option value="error">{i18n.t('ui.errorstab.errorsOnly')}</option>
              <option value="warning">
                {i18n.t('ui.errorstab.warningsOnly')}
              </option>
            </Select>
            <Select
              label={i18n.t('ui.errorstab.filterType')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              variant="compact"
            >
              <option value="all">{i18n.t('ui.errorstab.allTypes')}</option>
              {types
                .filter((type) => type !== 'all')
                .map((type) => (
                  <ErrorTypeOption key={type} type={type} />
                ))}
            </Select>
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  setFilterLevel('all')
                  setFilterType('all')
                }}
                variant="reset"
              >
                {i18n.t('ui.errorstab.reset')}
              </Button>
            )}
          </Inline>
        </>
      )}

      {/* Table */}
      <Layout overflow="auto">
        <Surface variant="outlined">
          <Surface variant="compactTable" as="table">
            <thead>
              <Surface as="tr" variant="tableHeader">
                {ERROR_COLUMNS.map((column) => (
                  <ErrorColumnHeader
                    key={column[0]}
                    column={column}
                    direction={sortDir}
                    onSort={handleSort}
                    sortColumn={sortCol}
                  />
                ))}
              </Surface>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <Inset colSpan={7} as="td" inset="spacious">
                    <Text as="div" tone="subtle" align="center">
                      {errors.length === 0
                        ? i18n.t('ui.errorstab.noPipelineAnomaliesDetected')
                        : i18n.t('ui.errorstab.noAnomaliesForThisFilter')}
                    </Text>
                  </Inset>
                </tr>
              ) : (
                filtered.map((error) => (
                  <PipelineErrorTableRow key={error.id} error={error} />
                ))
              )}
            </tbody>
          </Surface>
        </Surface>
      </Layout>

      {filtered.length < errors.length && (
        <Text as="p" variant="caption" tone="subtle" align="right">
          {i18n.t('ui.errorstab.showingAnomalies', {
            shown: filtered.length,
            total: errors.length,
          })}
        </Text>
      )}
    </Stack>
  )
}

const SOURCE_LABELS: Record<string, string> = {
  main: i18n.t('ui.errorstab.ingestPortfolioPy'),
  fetch_prices: i18n.t('ui.errorstab.fetchPricesPy'),
}

const ERROR_COLUMNS: [
  PipelineErrorSortColumn,
  string,
  'w-20' | 'w-40' | 'w-28' | 'w-24' | '',
][] = [
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
    return (
      <Layout as="span" flow="inline">
        <Text tone="subtle">↕</Text>
      </Layout>
    )
  return (
    <Layout as="span" flow="inline">
      <Text tone="muted">{dir === 'asc' ? '↑' : '↓'}</Text>
    </Layout>
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
  const [id, label] = column
  return (
    <Inset as="th" inset="compact">
      <Text as="div" variant="selectableHeader" tone="muted" align="left">
        <Button onClick={() => onSort(id)} variant="sort">
          {label}
          <SortIcon col={id} sortCol={sortColumn} dir={direction} />
        </Button>
      </Text>
    </Inset>
  )
}

type PipelineErrorRow = ReturnType<
  typeof buildPipelineErrorsViewModel
>['rows'][number]

function PipelineErrorTableRow({ error }: { error: PipelineErrorRow }) {
  const formatDate = useFormatDate()
  const formatAssetLabel = useFormatAssetLabel()
  return (
    <StatusTableRow level={error.level === 'error' ? 'error' : 'warning'}>
      <Inset as="td" inset="compact">
        <LevelBadge level={error.level === 'error' ? 'error' : 'warning'}>
          <Layout as="span" flow="inline" align="center" gap="compact">
            {error.level === 'error'
              ? i18n.t('ui.errorstab.error.8af296')
              : i18n.t('ui.errorstab.warning.6270bb')}
          </Layout>
        </LevelBadge>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" tone="secondary">
          {PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="subtle">
          {SOURCE_LABELS[error.source] ?? error.source}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="muted">
          {error.date ? formatDate(error.date, { style: 'isoDate' }) : '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text
          as="div"
          tone="secondary"
          truncate
          title={formatAssetLabel(error)}
        >
          {formatAssetLabel(error, '—')}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="code" tone="subtle">
          {error.isin || '—'}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text as="div" variant="relaxed" tone="muted">
          {error.message}
        </Text>
      </Inset>
    </StatusTableRow>
  )
}
