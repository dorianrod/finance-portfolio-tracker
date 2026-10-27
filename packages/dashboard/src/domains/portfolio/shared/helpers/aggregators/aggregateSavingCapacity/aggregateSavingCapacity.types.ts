// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
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
