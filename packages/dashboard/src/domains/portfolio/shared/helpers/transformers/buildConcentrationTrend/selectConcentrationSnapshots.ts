export function selectConcentrationSnapshots<T>(
  snapshots: Array<[number, T]>,
  atDates?: Date[],
): Array<[number, T]> {
  const sorted = snapshots.toSorted(([left], [right]) => left - right)
  if (!atDates) return sorted
  const selected = new Set<number>()
  for (const end of atDates) {
    let latest: number | undefined
    for (const [date] of sorted) {
      if (date > end.getTime()) break
      latest = date
    }
    if (latest != null) selected.add(latest)
  }
  return sorted.filter(([date]) => selected.has(date))
}
