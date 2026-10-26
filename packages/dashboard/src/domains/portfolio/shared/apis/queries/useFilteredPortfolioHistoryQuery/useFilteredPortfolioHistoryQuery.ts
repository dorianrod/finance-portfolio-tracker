// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'

import { requestFilteredPortfolioHistory } from './requestFilteredPortfolioHistory'

export function useFilteredPortfolioHistoryQuery(
  selectedAccounts: Set<string>,
) {
  const normalizedAccounts = useMemo(
    () => normalizeAccountSelection(selectedAccounts),
    [selectedAccounts],
  )
  return useQuery<PortfolioHistoryResponse, Error, PortfolioHistoryPoint[]>({
    queryKey: portfolioQueryKeys.data(
      'filtered-history',
      ...normalizedAccounts,
    ),
    queryFn: ({ signal }) =>
      requestFilteredPortfolioHistory(normalizedAccounts, signal),
    select: toHistory,
    enabled: selectedAccounts.size > 0,
  })
}

function toHistory(
  response: PortfolioHistoryResponse,
): PortfolioHistoryPoint[] {
  return response.history.map((point) => ({
    date: point.snapshot_date,
    total_value: point.total_value,
    total_cost_basis: point.total_cost_basis,
    unrealized_gain: point.unrealized_gain,
    net_cash_injected: point.net_cash_injected,
    cash_delta: point.cash_delta,
    tri: point.tri,
    tri_rolling_1y: point.tri_rolling_1y,
    tri_rolling_3y: point.tri_rolling_3y,
    total_broker_cash: 0,
  }))
}
