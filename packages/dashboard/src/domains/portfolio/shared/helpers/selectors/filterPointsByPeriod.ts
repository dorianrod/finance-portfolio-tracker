export function filterPointsByPeriod<T extends { date: Date }>(
  points: T[],
  dateFrom?: Date,
  dateTo?: Date,
): T[] {
  return points.filter((point) => {
    if (dateFrom && point.date < dateFrom) return false
    if (dateTo && point.date > dateTo) return false
    return true
  })
}
