import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { buildExposureRows } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/helpers/presenters/buildExposureRows'
import { buildFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/helpers/presenters/buildFundExposureViewModel'
import { buildFundIssuerExposures } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/transformers/issuerExposures/buildFundIssuerExposures'
import { selectExposureFund } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/transformers/selectExposureFund'
import { selectExposurePositions } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/transformers/selectExposurePositions'
import { useDashboardUnderlyingHoldings } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/actions/useDashboardUnderlyingHoldings'
import { dashboardExpandedUnderlyingIssuersAtom } from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings/dashboardExpandedUnderlyingIssuers.atoms'
import { dashboardUnderlyingSortAtom } from '@/domains/portfolio/features/holdings/features/fund-look-through/stores/dashboardUnderlyingHoldings/dashboardUnderlyingSort.atoms'
import { useGetFundHoldingsQuery } from '@/domains/portfolio/features/holdings/shared/apis/queries/useGetFundHoldingsQuery'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

/*
 * @architecture-decision exposure-aggregation-independent-of-disclosure
 * @rules ui-vercel-responsive-rendering, helpers-categories
 * @choice Memoize financial aggregation separately from search, sorting and disclosure rows.
 * @reason Only an exact fund-name selection changes the aggregate scope; disclosure must preserve issuer and security references.
 * @alternative A single model memo reruns source indexing and aggregation for every disclosure or sort update.
 * @revisit Disclosure starts changing financial scope or exact fund selection semantics change.
 */
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
  const needle = query.trim().toLocaleLowerCase()
  const applicablePositions = useMemo(
    () => selectExposurePositions(positions),
    [positions],
  )
  const selectedFundName = useMemo(
    () => selectExposureFund(applicablePositions, statuses, needle),
    [applicablePositions, statuses, needle],
  )
  const exposures = useMemo(
    () =>
      buildFundIssuerExposures(
        applicablePositions,
        holdings,
        statuses,
        selectedFundName,
      ),
    [applicablePositions, holdings, statuses, selectedFundName],
  )
  const exposure = useMemo(
    () =>
      buildFundExposureViewModel({ exposures, needle, selectedFundName, sort }),
    [exposures, needle, selectedFundName, sort],
  )
  const rows = useMemo(
    () => buildExposureRows(exposure.displayed, expanded),
    [exposure.displayed, expanded],
  )
  return useMemo(
    () => ({ ...actions, ...exposure, rows, query, sort }),
    [actions, exposure, rows, query, sort],
  )
}

const EMPTY_FUND_STATUSES: FundHoldingStatus[] = []
