import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import { aggregateBrokerageCash, type RawCashRow, type CashHistoryPoint } from '@/logic/cashHistory.logic'

export type { CashHistoryPoint }

export function useCashHistory() {
  const [cashHistory, setCashHistory] = useState<CashHistoryPoint[]>([])

  useEffect(() => {
    parseCsv<RawCashRow>(dataUrl('cash.csv')).then((rows) => {
      setCashHistory(aggregateBrokerageCash(rows))
    })
  }, [])

  return { cashHistory }
}
