import { useMemo } from 'react'
import { useAllPositions } from './useAllPositions'
import { buildAccountTypeHistory, type AccountTypeHistoryPoint, type AccountTypeHistory } from '@/logic/accountTypeHistory.logic'

export type { AccountTypeHistoryPoint }

export function useAccountTypeHistory(accounts?: Set<string>): AccountTypeHistory {
  const rows = useAllPositions()

  const accountsKey = useMemo(
    () => (accounts && accounts.size > 0 ? [...accounts].sort().join(',') : ''),
    [accounts],
  )

  return useMemo(() => {
    const accountSet = accountsKey ? new Set(accountsKey.split(',')) : null
    return buildAccountTypeHistory(rows, accountSet)
  }, [rows, accountsKey])
}
