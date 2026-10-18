import { useEffect, useState } from 'react'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'
import {
  mapAnnualIncomeSavings,
  type AnnualIncomeSavingsPoint,
  type RawAnnualIncomeSavingsRow,
} from '@/logic/annualIncomeSavings.logic'

export function useAnnualIncomeSavings(): AnnualIncomeSavingsPoint[] {
  const [data, setData] = useState<AnnualIncomeSavingsPoint[]>([])

  useEffect(() => {
    parseCsv<RawAnnualIncomeSavingsRow>(dataUrl('annual_income_savings.csv'))
      .then((rows) => setData(mapAnnualIncomeSavings(rows)))
      .catch(() => setData([]))
  }, [])

  return data
}
