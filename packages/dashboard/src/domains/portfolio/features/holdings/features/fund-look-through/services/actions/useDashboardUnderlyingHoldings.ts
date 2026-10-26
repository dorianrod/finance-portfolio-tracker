import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'

export function useDashboardUnderlyingHoldings() {
  const setExpanded = useSetAtom(dashboardExpandedUnderlyingIssuersAtom)
  const setQuery = useSetAtom(dashboardUnderlyingQueryAtom)
  const setSort = useSetAtom(dashboardUnderlyingSortAtom)

  const toggleIssuer = useCallback(
    (id: string) => {
      setExpanded((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [setExpanded],
  )

  return useMemo(
    () => ({
      setQuery,
      setSort,
      toggleIssuer,
    }),
    [setQuery, setSort, toggleIssuer],
  )
}
