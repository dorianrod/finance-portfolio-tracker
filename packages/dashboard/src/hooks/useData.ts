import { useEffect, useState } from 'react'
import type { RawOperation, RawPosition, PositionRow } from '@/types/domain'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import { buildAccountLabels, buildPositionRows } from '@/logic/positionHierarchy.logic'

export function useData() {
  const [positions, setPositions] = useState<PositionRow[]>([])
  const [rawPositions, setRawPositions] = useState<RawPosition[]>([])
  const [rawOperations, setRawOperations] = useState<RawOperation[]>([])
  const [accountLabels, setAccountLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      parseCsv<RawOperation>(dataUrl('operations.csv')),
      parseCsv<RawPosition>(dataUrl('positions.csv')),
      parseCsv<{ account: string; label: string }>(dataUrl('accounts.csv')),
    ])
      .then(([ops, rawPositions, accountRows]) => {
        setAccountLabels(buildAccountLabels(accountRows))
        setPositions(buildPositionRows(ops, rawPositions))
        setRawPositions(rawPositions)
        setRawOperations(ops)
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { positions, rawPositions, rawOperations, accountLabels, loading, error }
}
