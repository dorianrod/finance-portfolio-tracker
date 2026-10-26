export function presetDateFrom(months: number, now = new Date()): Date {
  const year = now.getFullYear()
  const targetMonth = now.getMonth() - months
  const day =
    months === 0
      ? 1
      : Math.min(
          now.getDate(),
          new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate(),
        )
  return new Date(Date.UTC(year, targetMonth, day))
}
