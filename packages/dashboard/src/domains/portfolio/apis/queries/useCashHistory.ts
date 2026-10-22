import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { aggregateBrokerageCash, type RawCashRow, type CashHistoryPoint } from '@/domains/portfolio/helpers/cashHistory.logic'

export type { CashHistoryPoint }

export function useCashHistory() {
  const [cashHistory, setCashHistory] = useState<CashHistoryPoint[]>([])

  useEffect(() => {
    parseCsv<RawCashRow>(PORTFOLIO_ENDPOINTS.data.cash).then((rows) => {
      setCashHistory(aggregateBrokerageCash(rows))
    })
  }, [])

  return { cashHistory }
}
