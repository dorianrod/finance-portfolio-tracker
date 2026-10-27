import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'

import { requestAssetIrr } from './requestAssetIrr'
import { UNAVAILABLE_ASSET_IRR_SUMMARY } from './unavailableAssetIrrSummary'

export function useGetAssetIrrQuery(
  selectedAccounts: Set<string>,
  selectedAccountTypes: Set<string>,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
) {
  const accounts = useMemo(
    () => [...selectedAccounts].toSorted(),
    [selectedAccounts],
  )
  const accountTypes = useMemo(
    () => [...selectedAccountTypes].toSorted(),
    [selectedAccountTypes],
  )
  return useQuery<AssetIrrSummary>({
    placeholderData: keepPreviousData,
    queryKey: portfolioQueryKeys.data(
      'asset-irr',
      accounts,
      accountTypes,
      dateFrom,
      dateTo,
    ),
    queryFn: ({ signal }) =>
      STATIC_DEMO
        ? UNAVAILABLE_ASSET_IRR_SUMMARY
        : requestAssetIrr(accounts, accountTypes, dateFrom, dateTo, signal),
    enabled: Boolean(dateTo),
  })
}

const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true'
