// eslint-disable-next-line local/review-shared-feature-sharing -- Account labels and identities feed scope selection and the scope badges used by performance, wealth and quality. See SHARED_OWNERSHIP_AUDIT.md.
import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { buildAccountFilterLabels } from './buildAccountFilterLabels'

export function buildPortfolioFilterOptions(
  positions: PositionRow[],
  accountLabels: Record<string, string>,
) {
  const accountToType: Record<string, string> = {}
  for (const position of positions) {
    const id = accountFilterId(position)
    if (position.account_type) accountToType[id] = position.account_type
  }

  return {
    accountFilterLabels: buildAccountFilterLabels(positions, accountLabels),
    accountToType,
    allAccounts: [...new Set(positions.map(accountFilterId))].toSorted(),
    allAccountTypes: [
      ...new Set(
        positions
          .map((position) => position.account_type)
          .filter((type): type is string => !!type),
      ),
    ].toSorted(),
    allOperationTypes: [
      ...new Set(positions.flatMap((position) => [...position.operationTypes])),
    ].toSorted(),
  }
}
