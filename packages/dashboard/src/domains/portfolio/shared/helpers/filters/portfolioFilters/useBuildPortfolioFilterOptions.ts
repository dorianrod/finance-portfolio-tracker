import { useCallback } from 'react'

import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { useBuildAccountFilterLabels } from './useBuildAccountFilterLabels'

// The shell also uses these account IDs for history scope and types for position grouping.
export function useBuildPortfolioFilterOptions() {
  const buildAccountFilterLabels = useBuildAccountFilterLabels()
  return useCallback(
    (positions: PositionRow[], accountLabels: Record<string, string>) => {
      const accountTypesById = new Map<string, string>()
      for (const position of positions) {
        const id = accountFilterId(position)
        if (position.account_type)
          accountTypesById.set(id, position.account_type)
      }

      return {
        accountFilterLabels: buildAccountFilterLabels(positions, accountLabels),
        accountToType: Object.fromEntries(accountTypesById),
        allAccounts: [...new Set(positions.map(accountFilterId))].toSorted(),
        allAccountTypes: [
          ...new Set(
            positions
              .map((position) => position.account_type)
              .filter((type): type is string => !!type),
          ),
        ].toSorted(),
        allOperationTypes: [
          ...new Set(
            positions.flatMap((position) => [...position.operationTypes]),
          ),
        ].toSorted(),
      }
    },
    [buildAccountFilterLabels],
  )
}
