import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useQuery } from '@tanstack/react-query'
import { parseCsv } from '@/shared/csv/csvData'
import { assetDisplayLabel } from '@/domains/portfolio/helpers/formatters/assetLabel'
import { RAW_OPERATION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'

export interface MonthlyOp {
  date: string
  account: string
  operation_type: string
  total_amount: number
  label: string
}

export type MonthlyOpsMap = Map<string, MonthlyOp[]>

export function useMonthlyOps() {
  return useQuery<MonthlyOpsMap>({
    queryKey: portfolioQueryKeys.data('monthly-operations'),
    queryFn: async () => {
      const rows = await parseCsv(PORTFOLIO_ENDPOINTS.data.operations, RAW_OPERATION_SCHEMA)
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
          label: assetDisplayLabel(row),
        })
      }
      return map
    },
  })
}
