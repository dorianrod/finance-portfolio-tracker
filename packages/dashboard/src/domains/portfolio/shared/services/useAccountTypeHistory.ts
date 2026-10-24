import { useMemo } from 'react'
import { useAllPositions } from '@/domains/portfolio/shared/apis/queries/useAllPositions'
import {
  buildAccountTypeHistory,
  type AccountTypeHistory,
} from '@/domains/portfolio/shared/helpers/aggregators/buildAccountTypeHistory'

export function useAccountTypeHistory(accounts?: Set<string>): AccountTypeHistory {
  const { data: rows = [] } = useAllPositions()
  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].toSorted().join(',') : ''),
    [accounts],
  )

  return useMemo(() => {
    const accountSet = accountsKey ? new Set(accountsKey.split(',')) : null
    return buildAccountTypeHistory(rows, accountSet)
  }, [accountsKey, rows])
}
