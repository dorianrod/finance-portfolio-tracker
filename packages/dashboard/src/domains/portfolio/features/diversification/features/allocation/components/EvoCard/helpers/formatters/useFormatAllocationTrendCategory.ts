import { useCallback } from 'react'

import type { AllocationTrendCategory } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/types/allocationTrend.type'
import { useFormatGroupedAllocationLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatGroupedAllocationLabel'

export function useFormatAllocationTrendCategory() {
  const formatGrouped = useFormatGroupedAllocationLabel()
  return useCallback(
    (
      category: AllocationTrendCategory | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (category == null) return fallback
      return category.kind === 'group'
        ? formatGrouped(category.count, { fallback })
        : category.name
    },
    [formatGrouped],
  )
}
