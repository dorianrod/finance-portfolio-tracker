import { useEffect, useState } from 'react'
import type { RawPortfolioHistory, PortfolioHistoryPoint } from '@/types/history'
import { dataUrl, parseCsv } from '@/shared/csv/csvData'

export function usePortfolioHistory() {
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    parseCsv<RawPortfolioHistory>(dataUrl('portfolio_history.csv'))
      .then((rows) => {
        const points: PortfolioHistoryPoint[] = rows.map((r) => ({
          date: r.snapshot_date,
          total_value: parseFloat(r.total_value) || 0,
          total_cost_basis: parseFloat(r.total_cost_basis) || 0,
          unrealized_gain: parseFloat(r.unrealized_gain) || 0,
          net_cash_injected: parseFloat(r.net_cash_injected) || 0,
          cash_delta: r.cash_delta !== '' ? parseFloat(r.cash_delta) : null,
          tri: r.tri !== '' && r.tri != null ? parseFloat(r.tri) : null,
        }))
        setHistory(points)
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { history, loading, error }
}
