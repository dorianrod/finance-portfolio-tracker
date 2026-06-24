import type { HistoryPoint } from '@/hooks/usePositionsHistory'

export interface Operation {
  date: string
  operation_type: string
  total_amount: number
  realized_gain: number | null
}

export interface HoverChartDataPoint {
  date: string
  Value: number
  'Cost basis': number
  'Unit price': number
  hasBuy: boolean
  hasSell: boolean
  buyAmount?: number
  sellAmount?: number
  sellGain?: number
}

// Builds one point per month: the position's value/cost-basis/unit-price
// snapshot, plus that month's buy/sell activity (for the dot markers and
// tooltip breakdown).
export function buildHoverChartSeries(history: HistoryPoint[], operations: Operation[]): HoverChartDataPoint[] {
  return history.map((p) => {
    const month = p.date.slice(0, 7)
    const buysThisMonth = operations.filter((o) => o.date.slice(0, 7) === month && o.operation_type === 'BUY')
    const sellsThisMonth = operations.filter((o) => o.date.slice(0, 7) === month && o.operation_type === 'SELL')
    const buyAmount = buysThisMonth.reduce((s, o) => s + Math.abs(o.total_amount), 0)
    const sellAmount = sellsThisMonth.reduce((s, o) => s + Math.abs(o.total_amount), 0)
    const sellGain = sellsThisMonth.reduce((s, o) => s + (o.realized_gain ?? 0), 0)
    return {
      date: month,
      Value: p.value,
      'Cost basis': p.costBasis,
      'Unit price': p.last_price,
      hasBuy: buysThisMonth.length > 0,
      hasSell: sellsThisMonth.length > 0,
      buyAmount: buysThisMonth.length > 0 ? buyAmount : undefined,
      sellAmount: sellsThisMonth.length > 0 ? sellAmount : undefined,
      sellGain: sellsThisMonth.length > 0 ? sellGain : undefined,
    }
  })
}

export function computeUnitPriceDomain(chartData: HoverChartDataPoint[]): [number, number] | undefined {
  const unitPrices = chartData.map((d) => d['Unit price']).filter((v) => v > 0)
  if (unitPrices.length === 0) return undefined
  const min = Math.min(...unitPrices)
  const max = Math.max(...unitPrices)
  const padding = (max - min) * 0.15 || max * 0.05
  return [Math.max(0, min - padding), max + padding]
}

export interface RollingReturn {
  label: string
  pct: number
}

// 6-month, 1-year and since-start rolling unit-price performance as of the
// hovered `label` (a 'Unit price' series keyed by month).
export function computeRollingReturns(series: Array<{ date: string; 'Unit price': number }>, label: string): RollingReturn[] {
  const idx = series.findIndex((d) => d.date === label)
  if (idx < 0) return []
  const current = series[idx]['Unit price']
  if (current == null) return []

  const rows: RollingReturn[] = []
  for (const [lbl, months] of [['6m', 6], ['1y', 12]] as const) {
    const ref = series[idx - months]?.['Unit price']
    if (ref != null && ref !== 0) rows.push({ label: lbl, pct: (current / ref - 1) * 100 })
  }
  const first = series[0]?.['Unit price']
  if (idx > 0 && first != null && first !== 0) rows.push({ label: 'Since start', pct: (current / first - 1) * 100 })

  return rows
}

export function computeMonthlyBalances(ops: { date: string; total_amount: number }[]) {
  const netByMonth = new Map<string, number>()
  for (const op of ops) {
    const month = op.date.slice(0, 7)
    netByMonth.set(month, (netByMonth.get(month) ?? 0) + op.total_amount)
  }
  const months = [...netByMonth.keys()].sort()
  let balance = 0
  return months.map((month) => {
    const delta = netByMonth.get(month)!
    balance += delta
    return { month, balance: Math.round(balance), delta: Math.round(delta) }
  })
}

export function computePosition(rect: DOMRect): { top: number; left: number } {
  const W = 600, H = 460, M = 10
  let left = rect.right + M
  let top = rect.top + rect.height / 2 - H / 2
  if (left + W > window.innerWidth - M) left = rect.left - W - M
  if (left < M) left = M
  if (top < M) top = M
  if (top + H > window.innerHeight - M) top = window.innerHeight - H - M
  return { top, left }
}
