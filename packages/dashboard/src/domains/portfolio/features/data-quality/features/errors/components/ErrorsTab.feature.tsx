import { useMemo, useState } from 'react'

import type { PipelineErrorSortColumn } from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/buildPipelineErrorsViewModel.types'
import { PIPELINE_ERROR_TYPE_LABELS } from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/pipelineErrorTypeLabels'
import { useBuildPipelineErrorsViewModel } from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/useBuildPipelineErrorsViewModel'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { Button } from '@/shared/ui/controls/Button.view'
import { Select } from '@/shared/ui/controls/Select.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { LevelBadge } from '@/shared/ui/statusBadge/LevelBadge.view'
import { StatusTableRow } from '@/shared/ui/statusBadge/StatusTableRow.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Filtering, sorting and availability belong to one anomaly table; row mapping and cells are already separate.
export function ErrorsTab({ errors }: Props) {
  const buildPipelineErrorsViewModel = useBuildPipelineErrorsViewModel()
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
        sortColumn: sortCol,
        sortDirection: sortDir,
      }),
    [
      errors,
      filterLevel,
      filterType,
      buildPipelineErrorsViewModel,
      sortCol,
      sortDir,
    ],
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
                    key={column.id}
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
  get main() {
    return i18n.t('ui.errorstab.ingestPortfolioPy')
  },
  get fetch_prices() {
    return i18n.t('ui.errorstab.fetchPricesPy')
  },
}

const ERROR_COLUMNS: Array<{
  id: PipelineErrorSortColumn
  label: string
  width: 'w-20' | 'w-40' | 'w-28' | 'w-24' | ''
}> = [
  {
    id: 'level',
    get label() {
      return i18n.t('ui.errorstab.level')
    },
    width: 'w-20',
  },
  {
    id: 'type',
    get label() {
      return i18n.t('ui.errorstab.type')
    },
    width: 'w-40',
  },
  {
    id: 'source',
    get label() {
      return i18n.t('ui.errorstab.source')
    },
    width: 'w-28',
  },
  {
    id: 'date',
    get label() {
      return i18n.t('ui.errorstab.date')
    },
    width: 'w-24',
  },
  {
    id: 'name',
    get label() {
      return i18n.t('ui.errorstab.asset')
    },
    width: 'w-28',
  },
  { id: 'isin', label: 'ISIN', width: 'w-24' },
  {
    id: 'message',
    get label() {
      return i18n.t('ui.errorstab.message')
    },
    width: '',
  },
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
  const { id, label } = column
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
  ReturnType<typeof useBuildPipelineErrorsViewModel>
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
          {formatDate(error.date, { style: 'isoDate' })}
        </Text>
      </Inset>
      <Inset as="td" inset="compact">
        <Text
          as="div"
          tone="secondary"
          truncate
          title={formatAssetLabel(error)}
        >
          {formatAssetLabel(error, { fallback: '—' })}
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
