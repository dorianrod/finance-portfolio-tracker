import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import type { RawOperation, RawPosition, PositionRow } from '@/domains/portfolio/types/domain'
import { parseCsv } from '@/shared/csv/csvData'
import { buildAccountLabels, buildPositionRows } from '@/domains/portfolio/helpers/positionHierarchy.logic'
import {
  ACCOUNT_ROW_SCHEMA,
  RAW_OPERATION_SCHEMA,
  RAW_POSITION_SCHEMA,
} from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export function useData() {
  const [positions, setPositions] = useState<PositionRow[]>([])
  const [rawPositions, setRawPositions] = useState<RawPosition[]>([])
  const [rawOperations, setRawOperations] = useState<RawOperation[]>([])
  const [accountLabels, setAccountLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.accounts, ACCOUNT_ROW_SCHEMA),
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
