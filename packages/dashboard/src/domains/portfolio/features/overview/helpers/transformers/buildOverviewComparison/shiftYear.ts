export function shiftYear(date: Date, offset: number): Date {
  const targetYear = date.getUTCFullYear() + offset
  const month = date.getUTCMonth()
  const day = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate(),
  )
  return new Date(Date.UTC(targetYear, month, day))
}
