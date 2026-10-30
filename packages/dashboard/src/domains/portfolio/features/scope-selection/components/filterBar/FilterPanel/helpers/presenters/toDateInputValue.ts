export function toDateInputValue(date: Date | null | undefined): string {
  return date?.toISOString().slice(0, 10) ?? ''
}
