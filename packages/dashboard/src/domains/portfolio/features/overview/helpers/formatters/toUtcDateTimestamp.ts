export function toUtcDateTimestamp(date: string): number {
  return Date.parse(`${date.slice(0, 10)}T00:00:00Z`)
}
