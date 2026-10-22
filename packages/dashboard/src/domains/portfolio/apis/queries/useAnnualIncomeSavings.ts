import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import {
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
  type RawAnnualIncomeSavingsRow,
} from '@/domains/portfolio/helpers/annualIncomeSavings.logic'

export function useAnnualIncomeSavings(): AnnualIncomeSavingsPoint[] {
  const [data, setData] = useState<AnnualIncomeSavingsPoint[]>([])

  useEffect(() => {
    parseCsv<RawAnnualIncomeSavingsRow>(PORTFOLIO_ENDPOINTS.data.annualIncomeSavings)
      .then((rows) => setData(mapAnnualIncomeSavings(rows)))
      .catch(() => setData([]))
  }, [])

  return data
}
