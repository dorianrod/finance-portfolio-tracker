import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import type { RawOperation, RawPosition, PositionRow } from '@/domains/portfolio/types/domain'
import { parseCsv } from '@/shared/csv/csvData'
import { buildAccountLabels, buildPositionRows } from '@/domains/portfolio/helpers/positionHierarchy.logic'

export function useData() {
  const [positions, setPositions] = useState<PositionRow[]>([])
  const [rawPositions, setRawPositions] = useState<RawPosition[]>([])
  const [rawOperations, setRawOperations] = useState<RawOperation[]>([])
  const [accountLabels, setAccountLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      parseCsv<RawOperation>(PORTFOLIO_ENDPOINTS.data.operations),
      parseCsv<RawPosition>(PORTFOLIO_ENDPOINTS.data.positions),
      parseCsv<{ account: string; label: string }>(PORTFOLIO_ENDPOINTS.data.accounts),
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
