import { useCallback } from 'react'

import { useFormatPipelineErrorType } from '@/domains/portfolio/features/data-quality/features/errors/helpers/formatters/useFormatPipelineErrorType'
import type { countPipelineIssues } from '@/domains/portfolio/features/data-quality/shared/helpers/transformers/countPipelineIssues'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'

import type { PipelineErrorSortColumn } from './buildPipelineErrorsViewModel.types'

export function useBuildPipelineErrorsViewModel() {
  const formatType = useFormatPipelineErrorType()
  const formatAssetLabel = useFormatAssetLabel()
  return useCallback(
    ({
      errors,
      issueCounts,
      filterLevel,
      filterType,
      sortColumn,
      sortDirection,
    }: {
      errors: PipelineError[]
      issueCounts: ReturnType<typeof countPipelineIssues>
      filterLevel: 'all' | 'error' | 'warning'
      filterType: string
      sortColumn: PipelineErrorSortColumn
      sortDirection: 'asc' | 'desc'
    }) => {
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
              return formatType(error.type)
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
        ...issueCounts,
        rows,
        types,
      }
    },
    [formatAssetLabel, formatType],
  )
}
