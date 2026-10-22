import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export interface RawPositionRow {
  snapshot_date: string
  account: string
  account_type: string
  account_category: string
  quantity: string
  avg_buy_price: string
  total_value: string
  unrealized_gain: string
}

export function useAllPositions(): RawPositionRow[] {
  const [rows, setRows] = useState<RawPositionRow[]>([])

  useEffect(() => {
    parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA)
      .then(setRows)
      .catch(() => setRows([]))
  }, [])

  return rows
}
