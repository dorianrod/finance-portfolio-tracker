import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { aggregateBrokerageCash, type CashHistoryPoint } from '@/domains/portfolio/helpers/cashHistory.logic'
import { RAW_CASH_ROW_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export type { CashHistoryPoint }

export function useCashHistory() {
  const [cashHistory, setCashHistory] = useState<CashHistoryPoint[]>([])

  useEffect(() => {
    parseCsv(PORTFOLIO_ENDPOINTS.data.cash, RAW_CASH_ROW_SCHEMA).then((rows) => {
      setCashHistory(aggregateBrokerageCash(rows))
    })
  }, [])

  return { cashHistory }
}
