import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

interface RawFundHolding {
  parent_isin: string
  parent_ticker: string
  parent_name: string
  holding_id: string
  holding_name: string
  weight: string
}

export interface FundHolding {
  parentIsin: string
  parentTicker: string
  parentName: string
  holdingId: string
  holdingName: string
  weight: number
}

export function useFundHoldings(): FundHolding[] {
  const [holdings, setHoldings] = useState<FundHolding[]>([])

  useEffect(() => {
    parseCsv<RawFundHolding>(dataUrl('fund_holdings.csv'))
      .then((rows) => setHoldings(rows
        .map((row) => ({
          parentIsin: row.parent_isin.trim(),
          parentTicker: row.parent_ticker.trim(),
          parentName: row.parent_name.trim(),
          holdingId: row.holding_id.trim(),
          holdingName: row.holding_name.trim(),
          weight: Number.parseFloat(row.weight),
        }))
        .filter((row) => row.holdingId && row.holdingName && row.weight > 0 && row.weight <= 1)))
      // The look-through file is optional for older data directories. In
      // that case concentration falls back to direct securities only.
      .catch(() => setHoldings([]))
  }, [])

  return holdings
}
