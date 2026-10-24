import { usePositionsQuery } from '@/domains/portfolio/shared/apis/queries/usePositionsQuery'
import {
  buildAccountTypeHistory,
  type AccountTypeHistory,
} from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'
import { useMemo } from 'react'

const EMPTY_POSITIONS: Parameters<typeof buildAccountTypeHistory>[0] = []

export function useAccountTypeHistory(accounts?: Set<string>): AccountTypeHistory {
  const { data: rows = EMPTY_POSITIONS } = usePositionsQuery()
  return useMemo(
    () => buildAccountTypeHistory(rows, accounts && accounts.size > 0 ? accounts : null),
    [accounts, rows],
  )
}
