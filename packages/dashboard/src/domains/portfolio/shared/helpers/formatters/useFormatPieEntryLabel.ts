import { useCallback } from 'react'

import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'

import { useFormatGroupedAllocationLabel } from './useFormatGroupedAllocationLabel'

export function useFormatPieEntryLabel() {
  const formatGrouped = useFormatGroupedAllocationLabel()
  return useCallback(
    (
      entry: Pick<PieEntry, 'name' | 'subItems'> | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (entry == null) return fallback
      if (entry.subItems && entry.subItems.length > 1)
        return formatGrouped(entry.subItems.length)
      return entry.name || fallback
    },
    [formatGrouped],
  )
}
