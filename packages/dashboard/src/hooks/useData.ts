import { useEffect, useState } from 'react'
import type { RawOperation, RawPosition, PositionRow } from '@/types/domain'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import { buildAccountLabels, buildPositionRows } from '@/logic/positionHierarchy.logic'

export function useData() {
  const [positions, setPositions] = useState<PositionRow[]>([])
  const [accountLabels, setAccountLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      parseCsv<RawOperation>(dataUrl('operations.csv')),
      parseCsv<RawPosition>(dataUrl('positions_aggregated.csv')),
      parseCsv<{ account: string; label: string }>(dataUrl('accounts.csv')),
    ])
      .then(([ops, rawPositions, accountRows]) => {
        setAccountLabels(buildAccountLabels(accountRows))
        setPositions(buildPositionRows(ops, rawPositions))
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { positions, accountLabels, loading, error }
}
