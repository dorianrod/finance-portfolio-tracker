import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { buildFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import { selectExposurePositions } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/selectors/selectExposurePositions'
import { useDashboardUnderlyingHoldings } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/actions/useDashboardUnderlyingHoldings'
import {
  dashboardExpandedUnderlyingIssuersAtom,
  dashboardUnderlyingSortAtom,
} from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { useFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useFundHoldingsQuery'
import type {
  FundHolding,
  FundHoldingStatus,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useFundExposureViewModel(
  positions: PositionRow[],
  holdings: FundHolding[],
) {
  const { data: fundData } = useFundHoldingsQuery()
  const statuses = fundData?.statuses ?? EMPTY_FUND_STATUSES
  const expanded = useAtomValue(dashboardExpandedUnderlyingIssuersAtom)
  const query = useAtomValue(dashboardUnderlyingQueryAtom)
  const sort = useAtomValue(dashboardUnderlyingSortAtom)
  const actions = useDashboardUnderlyingHoldings()
  const exposure = useMemo(
    () =>
      buildFundExposureViewModel({
        expanded,
        holdings,
        positions: selectExposurePositions(positions),
        query,
        sort,
        statuses,
      }),
    [expanded, holdings, positions, query, sort, statuses],
  )
  return useMemo(
    () => ({ ...actions, ...exposure, query, sort }),
    [actions, exposure, query, sort],
  )
}

const EMPTY_FUND_STATUSES: FundHoldingStatus[] = []
