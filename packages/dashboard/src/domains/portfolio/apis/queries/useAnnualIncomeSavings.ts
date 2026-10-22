import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import {
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
} from '@/domains/portfolio/helpers/annualIncomeSavings.logic'
import { RAW_ANNUAL_INCOME_SAVINGS_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export function useAnnualIncomeSavings(): AnnualIncomeSavingsPoint[] {
  const [data, setData] = useState<AnnualIncomeSavingsPoint[]>([])

  useEffect(() => {
    parseCsv(PORTFOLIO_ENDPOINTS.data.annualIncomeSavings, RAW_ANNUAL_INCOME_SAVINGS_SCHEMA)
      .then((rows) => setData(mapAnnualIncomeSavings(rows)))
      .catch(() => setData([]))
  }, [])

  return data
}
