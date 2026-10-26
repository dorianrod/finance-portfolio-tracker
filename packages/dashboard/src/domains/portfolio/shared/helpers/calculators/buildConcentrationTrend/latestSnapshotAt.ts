import type { HistoricalSnapshot } from './buildConcentrationTrend.types'

export function latestSnapshotAt(
  snapshots: HistoricalSnapshot[] | undefined,
  date: Date,
): HistoricalSnapshot | undefined {
  if (!snapshots) return undefined
  for (let index = snapshots.length - 1; index >= 0; index -= 1) {
    if (snapshots[index].effectiveDate <= date) return snapshots[index]
  }
  return undefined
}
