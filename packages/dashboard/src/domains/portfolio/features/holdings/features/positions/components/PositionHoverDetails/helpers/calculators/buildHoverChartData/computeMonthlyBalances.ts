import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

export function computeMonthlyBalances(
  ops: { date: Date; total_amount: number }[],
) {
  const netByMonth = new Map<string, number>()
  for (const op of ops) {
    const month = toCalendarMonth(op.date)
    netByMonth.set(month, (netByMonth.get(month) ?? 0) + op.total_amount)
  }
  const months = [...netByMonth.entries()].toSorted(([left], [right]) =>
    left.localeCompare(right),
  )
  let balance = 0
  return months.map(([month, delta]) => {
    balance += delta
    return { month, balance: Math.round(balance), delta: Math.round(delta) }
  })
}
