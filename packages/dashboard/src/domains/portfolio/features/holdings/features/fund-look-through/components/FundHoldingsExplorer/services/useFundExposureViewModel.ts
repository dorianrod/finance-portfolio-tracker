import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { buildFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import { selectExposurePositions } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/selectors/selectExposurePositions'
import { useDashboardUnderlyingHoldings } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/actions/useDashboardUnderlyingHoldings'
import { dashboardExpandedUnderlyingIssuersAtom } from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings/dashboardExpandedUnderlyingIssuersAtom'
import { dashboardUnderlyingSortAtom } from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings/dashboardUnderlyingSortAtom'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { useGetFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useGetFundHoldingsQuery'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useFundExposureViewModel(
  positions: PositionRow[],
  holdings: FundHolding[],
) {
  const { data: fundData } = useGetFundHoldingsQuery()
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
