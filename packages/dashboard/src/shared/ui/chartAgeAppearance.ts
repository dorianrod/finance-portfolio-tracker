export function chartAgeOpacity({
  year,
  recent,
  oldestYear,
  newestYear,
}: ChartAge) {
  if (recent) return 1
  return (
    0.3 + ((year - oldestYear) / Math.max(1, newestYear - oldestYear)) * 0.35
  )
}

export type ChartAge = {
  year: number
  recent: boolean
  oldestYear: number
  newestYear: number
}
