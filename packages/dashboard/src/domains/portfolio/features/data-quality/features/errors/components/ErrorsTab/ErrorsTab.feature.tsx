import { useMemo, useState } from 'react'

import type { PipelineErrorSortColumn } from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/buildPipelineErrorsViewModel.types'
import { useBuildPipelineErrorsViewModel } from '@/domains/portfolio/features/data-quality/features/errors/helpers/mappers/buildPipelineErrorsViewModel/useBuildPipelineErrorsViewModel'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'

import { ErrorsTabView } from './ErrorsTab.view'

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

  const model = useMemo(
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
  return (
    <ErrorsTabView
      model={model}
      totalCount={errors.length}
      filterLevel={filterLevel}
      filterType={filterType}
      sortCol={sortCol}
      sortDir={sortDir}
      onLevelChange={setFilterLevel}
      onTypeChange={setFilterType}
      onSort={handleSort}
      onReset={() => {
        setFilterLevel('all')
        setFilterType('all')
      }}
    />
  )
}

type Props = { errors: PipelineError[] }
