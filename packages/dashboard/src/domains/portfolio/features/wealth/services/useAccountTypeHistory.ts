import { useMemo } from 'react'

import {
  type AccountTypeHistory,
  buildAccountTypeHistory,
} from '@/domains/portfolio/features/wealth/helpers/aggregators/buildAccountTypeHistory'
import { usePositionsQuery } from '@/domains/portfolio/shared/apis/queries/usePositionsQuery'

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

const EMPTY_POSITIONS: Parameters<typeof buildAccountTypeHistory>[0] = []
