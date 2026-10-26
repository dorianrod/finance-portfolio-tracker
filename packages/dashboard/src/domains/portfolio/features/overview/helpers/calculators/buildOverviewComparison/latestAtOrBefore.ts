export function latestAtOrBefore<T extends { date: Date }>(
  points: T[],
  end: Date,
): T | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].date <= end) return points[index]
  }
  return null
}
