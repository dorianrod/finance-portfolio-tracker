import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/transformers/normalizeAccountSelection'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PortfolioHistoryResponse } from '@/domains/portfolio/shared/types/portfolioHistoryResponse.type'

import { requestFilteredPortfolioHistory } from './requestFilteredPortfolioHistory'

export function useGetFilteredPortfolioHistoryQuery(
  selectedAccounts: Set<string>,
) {
  const normalizedAccounts = useMemo(
    () => normalizeAccountSelection(selectedAccounts),
    [selectedAccounts],
  )
  return useQuery<PortfolioHistoryResponse, Error, PortfolioHistoryPoint[]>({
    placeholderData: keepPreviousData,
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
  }))
}
