import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { dataUrl } from '@/shared/csv/csvData'

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
    Papa.parse<RawPositionRow>(dataUrl('positions.csv'), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (r) => setRows(r.data),
    })
  }, [])

  return rows
}
