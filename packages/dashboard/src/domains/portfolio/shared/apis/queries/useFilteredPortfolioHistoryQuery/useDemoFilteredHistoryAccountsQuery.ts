import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/shared/apis/endpoints'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'

import { readResponse } from './readResponse'
import { STATIC_DEMO } from './staticDemo'

export function useDemoFilteredHistoryAccountsQuery() {
  return useQuery<string[] | null>({
    queryKey: portfolioQueryKeys.data('demo-filtered-history-accounts'),
    queryFn: ({ signal }) => requestDemoPresetAccounts(signal),
    enabled: STATIC_DEMO,
  })
}

async function requestDemoPresetAccounts(
  signal: AbortSignal,
): Promise<string[] | null> {
  if (!STATIC_DEMO) return null
  const fixture = await readResponse(
    await fetch(PORTFOLIO_ENDPOINTS.data.demoFilteredHistory, { signal }),
  )
  return normalizeAccountSelection(fixture.accounts)
}
