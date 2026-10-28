import { useCallback } from 'react'

import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useBuildAccountFilterLabels() {
  const formatAccountLabel = useFormatAccountLabel()
  return useCallback(
    (
      positions: PositionRow[],
      labels: Record<string, string>,
    ): Record<string, string> => {
      const resolvedLabels = new Map(Object.entries(labels))
      for (const position of positions) {
        const id = accountFilterId(position)
        if (!resolvedLabels.get(id)) {
          resolvedLabels.set(
            id,
            id === position.account
              ? formatAccountLabel(position.account, { labels })
              : position.name,
          )
        }
      }
      return Object.fromEntries(resolvedLabels)
    },
    [formatAccountLabel],
  )
}
