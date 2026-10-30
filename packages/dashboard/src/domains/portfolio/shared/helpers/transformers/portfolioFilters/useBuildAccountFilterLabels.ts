import { useCallback } from 'react'

import { accountFilterId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/accountFilterId'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

/*
 * @architecture-decision account-scope-data-and-labels
 * @rules helpers-categories, arch-no-visual-logic-below-page
 * @choice Keep source account labels and cash aliases as data; consumers format them.
 * @reason Shared account IDs/types feed history, wealth and performance as well as pickers.
 * @alternative A common formatted-label builder makes data services depend on presentation.
 * @revisit Account identity or the source/cash alias protocol gains a different lifecycle.
 */
export function useBuildAccountFilterLabels() {
  return useCallback(
    (
      positions: PositionRow[],
      labels: Record<string, string>,
    ): Record<string, string> => {
      const resolvedLabels = new Map(Object.entries(labels))
      for (const position of positions) {
        const id = accountFilterId(position)
        if (!resolvedLabels.has(id) && id !== position.account) {
          resolvedLabels.set(id, position.name)
        }
      }
      return Object.fromEntries(resolvedLabels)
    },
    [],
  )
}
