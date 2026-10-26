import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import type { AssetLabelSource } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'

import type { PipelineErrorSortColumn } from './buildPipelineErrorsViewModel.types'
import { PIPELINE_ERROR_TYPE_LABELS } from './pipelineErrorTypeLabels'

export function buildPipelineErrorsViewModel({
  errors,
  filterLevel,
  filterType,
  sortColumn,
  sortDirection,
  formatAssetLabel,
}: {
  errors: PipelineError[]
  filterLevel: 'all' | 'error' | 'warning'
  filterType: string
  sortColumn: PipelineErrorSortColumn
  sortDirection: 'asc' | 'desc'
  formatAssetLabel: (source: AssetLabelSource, fallback?: string) => string
}) {
  const types = [
    'all',
    ...new Set(errors.map((error) => error.type)),
  ].toSorted()
  const filtered = errors
    .map((error, index) => ({ ...error, id: String(index) }))
    .filter(
      (error) =>
        (filterLevel === 'all' || error.level === filterLevel) &&
        (filterType === 'all' || error.type === filterType),
    )
  const rows = filtered.toSorted((left, right) => {
    if (sortColumn === 'date') {
      const comparison =
        (left.date?.getTime() ?? 0) - (right.date?.getTime() ?? 0)
      return sortDirection === 'asc' ? comparison : -comparison
    }
    const value = (error: PipelineError): string => {
      switch (sortColumn) {
        case 'level':
          return error.level
        case 'type':
          return PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type
        case 'source':
          return error.source
        case 'name':
          return formatAssetLabel(error)
        case 'isin':
          return error.isin
        case 'message':
          return error.message
      }
    }
    const comparison = value(left).localeCompare(value(right), 'en')
    return sortDirection === 'asc' ? comparison : -comparison
  })

  return {
    errorCount: errors.filter((error) => error.level === 'error').length,
    rows,
    types,
    warningCount: errors.filter((error) => error.level === 'warning').length,
  }
}
