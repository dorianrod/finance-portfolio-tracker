import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingQueryAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardUnderlyingHoldings.atoms'

export function useDashboardUnderlyingHoldings() {
  const setExpanded = useSetAtom(dashboardExpandedUnderlyingIssuersAtom)
  const setQuery = useSetAtom(dashboardUnderlyingQueryAtom)
  const setSort = useSetAtom(dashboardUnderlyingSortAtom)

  const toggleIssuer = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [setExpanded])

  return useMemo(() => ({
    setQuery,
    setSort,
    toggleIssuer,
  }), [setQuery, setSort, toggleIssuer])
}
