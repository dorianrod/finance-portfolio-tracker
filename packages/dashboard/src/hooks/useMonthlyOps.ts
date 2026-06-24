import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

interface RawOp {
  date: string
  account: string
  account_type: string
  operation_type: string
  total_amount: string
  name: string
  ticker: string
}

export interface MonthlyOp {
  date: string
  account: string
  operation_type: string
  total_amount: number
  label: string
}

export type MonthlyOpsMap = Map<string, MonthlyOp[]>

export function useMonthlyOps(): MonthlyOpsMap {
  const [ops, setOps] = useState<MonthlyOpsMap>(new Map())

  useEffect(() => {
    parseCsv<RawOp>(dataUrl('operations.csv')).then((rows) => {
      const map = new Map<string, MonthlyOp[]>()
      for (const row of rows) {
        if (!['DEPOSIT', 'WITHDRAWAL'].includes(row.operation_type)) continue
        const amount = parseFloat(row.total_amount) || 0
        // month key = YYYY-MM
        const month = row.date.slice(0, 7)
        if (!map.has(month)) map.set(month, [])
        map.get(month)!.push({
          date: row.date.slice(0, 10),
          account: row.account,
          operation_type: row.operation_type,
          total_amount: amount,
          label: row.name || row.ticker || '',
        })
      }
      setOps(map)
    })
  }, [])

  return ops
}
