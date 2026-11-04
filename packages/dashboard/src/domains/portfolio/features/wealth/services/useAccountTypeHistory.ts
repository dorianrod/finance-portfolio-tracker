import { useMemo } from 'react'

import { buildAccountTypeHistory } from '@/domains/portfolio/features/wealth/helpers/transformers/buildAccountTypeHistory'
import type { AccountTypeHistory } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

/*
 * @architecture-decision feature-source-acquisition
 * @rules arch-helpers-vs-services, api-query-hook-choice
 * @choice Observe the coordinated positions cache here, then aggregate account types.
 * @reason Wealth shares the validated positions source with overview and performance; its shell projection must not suspend navigation.
 * @alternative Fetching this source again or calling its Suspense hook in the shell gives acquisition a second owner.
 * @revisit Wealth loads without the required-source coordinator or needs a different source lifecycle.
 */
export function useAccountTypeHistory(
  accounts?: Set<string>,
): AccountTypeHistory {
  const { data: rows = EMPTY_POSITIONS } = useCachedPortfolioSourceQuery<
    RawPositionRow[]
  >(PORTFOLIO_POSITIONS_QUERY_OPTIONS.queryKey)
  return useMemo(
    () =>
      buildAccountTypeHistory(
        rows,
        accounts && accounts.size > 0 ? accounts : null,
      ),
    [accounts, rows],
  )
}

const EMPTY_POSITIONS: RawPositionRow[] = []
