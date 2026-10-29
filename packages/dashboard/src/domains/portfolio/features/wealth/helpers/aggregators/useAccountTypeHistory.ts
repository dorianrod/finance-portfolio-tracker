import { useMemo } from 'react'

import { buildAccountTypeHistory } from '@/domains/portfolio/features/wealth/helpers/aggregators/buildAccountTypeHistory'
import type { AccountTypeHistory } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'
import { useGetPositionsQuery } from '@/domains/portfolio/shared/apis/queries/useGetPositionsQuery'

export function useAccountTypeHistory(
  accounts?: Set<string>,
): AccountTypeHistory {
  const { data: rows = EMPTY_POSITIONS } = useGetPositionsQuery()
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
