import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useFundHoldingsData } from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import type { FundHolding, FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { buildFundExposureViewModel } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'
import { useDashboardUnderlyingHoldings } from '@/domains/portfolio/shared/services/actions/useDashboardUnderlyingHoldings'
import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingQueryAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/shared/stores/dashboardUnderlyingHoldings.atoms'

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
