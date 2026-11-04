export function toCalendarMonth(date: Date): string {
  return date.toISOString().slice(0, 7)
}
