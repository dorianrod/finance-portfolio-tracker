import type {
  HoverChartDataPoint,
  RollingReturn,
} from './buildHoverChartData.types'

export function computeRollingReturns(
  series: readonly Pick<HoverChartDataPoint, 'date' | 'Unit price'>[],
): Map<string, RollingReturn[]> {
  const prices = new Map(
    series.map((point) => [point.date, point['Unit price']]),
  )
  const firstMonth = series.reduce(
    (first, point) => (point.date < first ? point.date : first),
    series[0]?.date ?? '',
  )
  return new Map(
    [...prices].map(([month, current]) => [
      month,
      returnsAtMonth(prices, month, current, firstMonth),
    ]),
  )
}

function returnsAtMonth(
  prices: ReadonlyMap<string, number>,
  month: string,
  current: number,
  firstMonth: string,
): RollingReturn[] {
  if (!Number.isFinite(current)) return []
  const [year, calendarMonth] = month.split('-').map(Number)
  const monthIndex = year * 12 + calendarMonth - 1
  const rows: RollingReturn[] = []
  for (const [period, months] of [
    ['six-months', 6],
    ['one-year', 12],
  ] as const) {
    const referenceIndex = monthIndex - months
    const referenceMonth = `${Math.floor(referenceIndex / 12)}-${String((referenceIndex % 12) + 1).padStart(2, '0')}`
    appendReturn(rows, period, current, prices.get(referenceMonth))
  }
  if (month !== firstMonth)
    appendReturn(rows, 'since-start', current, prices.get(firstMonth))
  return rows
}

function appendReturn(
  rows: RollingReturn[],
  period: RollingReturn['period'],
  current: number,
  reference: number | undefined,
) {
  if (reference == null || reference === 0 || !Number.isFinite(reference))
    return
  rows.push({ period, pct: (current / reference - 1) * 100 })
}
