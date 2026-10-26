import type { DashboardLoadState } from '@/app/types/dashboardLoadState.type'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'

export function resolveDashboardLoadState(
  queries: SourceQuery[],
): DashboardLoadState {
  const failure = queries.find((query) => query.error != null)
  if (failure)
    return { status: 'error', message: getErrorMessage(failure.error) }
  if (queries.some((query) => query.isPending)) return { status: 'loading' }
  return { status: 'ready' }
}

type SourceQuery = { error: unknown; isPending: boolean }
