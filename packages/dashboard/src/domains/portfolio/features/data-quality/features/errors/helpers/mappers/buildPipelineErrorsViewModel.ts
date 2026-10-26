import type { AssetLabelSource } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import i18n from '@/i18n/i18n'

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

export const PIPELINE_ERROR_TYPE_LABELS: Record<string, string> = {
  unresolved_ticker: i18n.t('ui.buildpipelineerrorsviewmodel.unresolvedTicker'),
  missing_price: i18n.t('ui.buildpipelineerrorsviewmodel.missingPrice'),
  missing_fx_rate: i18n.t('ui.buildpipelineerrorsviewmodel.missingFxRate'),
  parsing_error: i18n.t('ui.buildpipelineerrorsviewmodel.parsingError'),
  missing_data: i18n.t('ui.buildpipelineerrorsviewmodel.missingData'),
}

export type PipelineErrorSortColumn =
  'level' | 'type' | 'source' | 'date' | 'name' | 'isin' | 'message'
