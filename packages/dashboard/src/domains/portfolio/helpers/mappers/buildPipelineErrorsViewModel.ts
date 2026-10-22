import type { ErrorRow } from '@/domains/portfolio/apis/queries/useErrors'
import { assetDisplayLabel } from '@/domains/portfolio/helpers/formatters/assetLabel'

export const PIPELINE_ERROR_TYPE_LABELS: Record<string, string> = {
  unresolved_ticker: 'Unresolved ticker',
  missing_price: 'Missing price',
  missing_fx_rate: 'Missing FX rate',
  parsing_error: 'Parsing error',
  missing_data: 'Missing data',
}

export type PipelineErrorSortColumn =
  | 'level'
  | 'type'
  | 'source'
  | 'date'
  | 'name'
  | 'isin'
  | 'message'

export function buildPipelineErrorsViewModel({
  errors,
  filterLevel,
  filterType,
  sortColumn,
  sortDirection,
}: {
  errors: ErrorRow[]
  filterLevel: 'all' | 'error' | 'warning'
  filterType: string
  sortColumn: PipelineErrorSortColumn
  sortDirection: 'asc' | 'desc'
}) {
  const types = ['all', ...new Set(errors.map((error) => error.type))].toSorted()
  const filtered = errors.filter((error) => (
    (filterLevel === 'all' || error.level === filterLevel)
    && (filterType === 'all' || error.type === filterType)
  ))
  const rows = filtered.toSorted((left, right) => {
    const value = (error: ErrorRow): string => {
      switch (sortColumn) {
        case 'level': return error.level
        case 'type': return PIPELINE_ERROR_TYPE_LABELS[error.type] ?? error.type
        case 'source': return error.source
        case 'date': return error.date
        case 'name': return assetDisplayLabel(error)
        case 'isin': return error.isin
        case 'message': return error.message
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
