import { useMemo } from 'react'

import { usePositionsQuery } from '@/domains/portfolio/shared/apis/queries/usePositionsQuery'
import {
  type AccountTypeHistory,
  buildAccountTypeHistory,
} from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'

const EMPTY_POSITIONS: Parameters<typeof buildAccountTypeHistory>[0] = []

export function useAccountTypeHistory(
  accounts?: Set<string>,
): AccountTypeHistory {
  const { data: rows = EMPTY_POSITIONS } = usePositionsQuery()
  return useMemo(
    () =>
      buildAccountTypeHistory(
        rows,
        accounts && accounts.size > 0 ? accounts : null,
      ),
    [accounts, rows],
  )
}
