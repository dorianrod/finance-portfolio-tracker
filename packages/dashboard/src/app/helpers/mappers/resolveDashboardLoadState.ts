import type { DashboardLoadState } from '@/app/DashboardLoadState.state'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'

type SourceQuery = { error: unknown; isPending: boolean }

export function resolveDashboardLoadState(
  queries: SourceQuery[],
): DashboardLoadState {
  const failure = queries.find((query) => query.error != null)
  if (failure)
    return { status: 'error', message: getErrorMessage(failure.error) }
  if (queries.some((query) => query.isPending)) return { status: 'loading' }
  return { status: 'ready' }
}
