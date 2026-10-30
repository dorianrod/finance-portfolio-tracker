export function dateTimestamp(date: Date | undefined): number | null {
  if (!date) return null
  const timestamp = date.getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}
