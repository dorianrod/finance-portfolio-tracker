export type AllocationTrend = {
  categories: AllocationTrendCategory[]
  rows: AllocationTrendPoint[]
}

export type AllocationTrendCategory =
  { kind: 'category'; name: string } | { kind: 'group'; count: number }
export type AllocationTrendPoint = {
  date: number
  // A snapshot without allocation values leaves a gap in each series.
  values: Array<number | null>
}
