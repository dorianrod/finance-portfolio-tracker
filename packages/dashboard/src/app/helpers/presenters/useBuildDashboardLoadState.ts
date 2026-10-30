import type { UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { DashboardLoadState } from '@/app/types/dashboardLoadState.type'
import { useFormatErrorMessage } from '@/shared/helpers/formatters/useFormatErrorMessage'

export function useBuildDashboardLoadState() {
  const formatErrorMessage = useFormatErrorMessage()
  return useCallback(
    (queries: SourceQuery[]): DashboardLoadState => {
      const failure = queries.find((query) => query.error != null)
      if (failure)
        return { status: 'error', message: formatErrorMessage(failure.error) }
      if (queries.some((query) => query.isPending)) return { status: 'loading' }
      return { status: 'ready' }
    },
    [formatErrorMessage],
  )
}

type SourceQuery = Pick<UseQueryResult, 'error' | 'isPending'>
