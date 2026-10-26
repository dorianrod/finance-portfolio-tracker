import { accountFilterId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/accountFilterId'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { accountLabel } from './accountLabel'

export function buildAccountFilterLabels(
  positions: PositionRow[],
  labels: Record<string, string>,
): Record<string, string> {
  const resolvedLabels = { ...labels }
  for (const position of positions) {
    const id = accountFilterId(position)
    if (!resolvedLabels[id]) {
      resolvedLabels[id] =
        id === position.account
          ? accountLabel(position.account, labels)
          : position.name
    }
  }
  return resolvedLabels
}
