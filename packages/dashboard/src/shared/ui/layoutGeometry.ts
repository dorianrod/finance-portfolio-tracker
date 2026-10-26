export function layoutShare(value: number, total = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
  return Math.min(100, Math.max(0, (value / total) * 100))
}
