import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import {
  useFundHoldingsData,
  type FundHolding,
  type FundHoldingStatus,
} from '@/domains/portfolio/apis/queries/useFundHoldings'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { buildFundExposureViewModel } from '@/domains/portfolio/helpers/mappers/buildFundExposureViewModel'
import { useDashboardUnderlyingHoldings } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardUnderlyingHoldings'
import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingQueryAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardUnderlyingHoldings.atoms'

const EMPTY_FUND_STATUSES: FundHoldingStatus[] = []

export function useFundExposureViewModel(positions: PositionRow[], holdings: FundHolding[]) {
  const { data: fundData } = useFundHoldingsData()
  const statuses = fundData?.statuses ?? EMPTY_FUND_STATUSES
  const expanded = useAtomValue(dashboardExpandedUnderlyingIssuersAtom)
  const query = useAtomValue(dashboardUnderlyingQueryAtom)
  const sort = useAtomValue(dashboardUnderlyingSortAtom)
  const actions = useDashboardUnderlyingHoldings()
  const exposure = useMemo(
    () => buildFundExposureViewModel({
      expanded,
      holdings,
      positions,
      query,
      sort,
      statuses,
    }),
    [expanded, holdings, positions, query, sort, statuses],
  )
  return { ...actions, ...exposure, query, sort }
}
