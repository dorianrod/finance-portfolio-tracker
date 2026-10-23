export function formatPositionCount(value: number | null): string {
  if (value == null) return '—'
  return `${value} ${value === 1 ? 'position' : 'positions'}`
}
