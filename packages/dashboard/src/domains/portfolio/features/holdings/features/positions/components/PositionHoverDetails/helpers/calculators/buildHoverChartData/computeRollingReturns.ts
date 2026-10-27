import i18n from '@/i18n/i18n'

import type { RollingReturn } from './buildHoverChartData.types'

// 6-month, 1-year and since-start rolling unit-price performance as of the
// hovered `label` (a 'Unit price' series keyed by month).
// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Missing or zero reference prices must be guarded consistently for the two rolling periods and since-start return.
export function computeRollingReturns(
  series: Array<{ date: string; 'Unit price': number }>,
  label: string,
): RollingReturn[] {
  const idx = series.findIndex((d) => d.date === label)
  if (idx < 0) return []
  const current = series[idx]['Unit price']
  if (current == null) return []

  const rows: RollingReturn[] = []
  for (const [lbl, months] of [
    ['6m', 6],
    ['1y', 12],
  ] as const) {
    const ref = series[idx - months]?.['Unit price']
    if (ref != null && ref !== 0)
      rows.push({ label: lbl, pct: (current / ref - 1) * 100 })
  }
  const first = series[0]?.['Unit price']
  if (idx > 0 && first != null && first !== 0)
    rows.push({
      label: i18n.t('ui.buildhoverchartdataTs.sinceStart'),
      pct: (current / first - 1) * 100,
    })

  return rows
}
