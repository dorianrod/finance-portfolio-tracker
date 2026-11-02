export type RawSavingCapacityRow = {
  snapshot_date: Date
  savings_delta: number
  perf_delta: number
}

export type RawSavingCapacityByAccountRow = {
  snapshot_date: Date
  account: string
  savings_delta: number
  perf_delta: number
}
