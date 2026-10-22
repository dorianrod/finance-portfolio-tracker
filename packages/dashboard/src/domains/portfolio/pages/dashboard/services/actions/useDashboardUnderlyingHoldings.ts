import { useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingQueryAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardUnderlyingHoldings.atoms'

export function useDashboardUnderlyingHoldings() {
  const [expanded, setExpanded] = useAtom(dashboardExpandedUnderlyingIssuersAtom)
  const [query, setQuery] = useAtom(dashboardUnderlyingQueryAtom)
  const [sort, setSort] = useAtom(dashboardUnderlyingSortAtom)

  const toggleIssuer = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [setExpanded])

  return useMemo(() => ({
    expanded,
    query,
    setQuery,
    setSort,
    sort,
    toggleIssuer,
  }), [expanded, query, setQuery, setSort, sort, toggleIssuer])
}
