import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

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
    parseCsv<RawPositionRow>(dataUrl('positions.csv'))
      .then(setRows)
      .catch(() => setRows([]))
  }, [])

  return rows
}
