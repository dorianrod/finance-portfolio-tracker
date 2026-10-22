import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useEffect, useState } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { ALLOCATION_ROW_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export interface AllocationPoint {
  date: string
  /** Ordered categories for this snapshot, sorted by value desc, nc last */
  categories: Array<{ name: string; value: number }>
}

function toPoints(rows: Record<string, string>[]): AllocationPoint[] {
  return rows.map((row) => {
    const categories = Object.entries(row)
      .filter(([key]) => key !== 'snapshot_date')
      .map(([name, val]) => ({ name, value: parseFloat(val) || 0 }))
      .filter((c) => c.value > 0)
    // Sort: nc last, then by value desc
    categories.sort((a, b) => {
      if (a.name === 'nc') return 1
      if (b.name === 'nc') return -1
      return b.value - a.value
    })
    return { date: row.snapshot_date, categories }
  })
}

export interface AllocationData {
  geo: AllocationPoint[]
  secteur: AllocationPoint[]
  currency: AllocationPoint[]
  classe: AllocationPoint[]
  loading: boolean
}

export function useAllocationData(): AllocationData {
  const [data, setData] = useState<AllocationData>({
    geo: [],
    secteur: [],
    currency: [],
    classe: [],
    loading: true,
  })

  useEffect(() => {
    Promise.all([
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsGeo, ALLOCATION_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsSecteur, ALLOCATION_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsCurrency, ALLOCATION_ROW_SCHEMA),
      parseCsv(PORTFOLIO_ENDPOINTS.data.positionsClasse, ALLOCATION_ROW_SCHEMA),
    ])
      .then(([geo, secteur, currency, classe]) => {
        setData({
          geo: toPoints(geo),
          secteur: toPoints(secteur),
          currency: toPoints(currency),
          classe: toPoints(classe),
          loading: false,
        })
      })
      .catch(() => setData((d) => ({ ...d, loading: false })))
  }, [])

  return data
}
