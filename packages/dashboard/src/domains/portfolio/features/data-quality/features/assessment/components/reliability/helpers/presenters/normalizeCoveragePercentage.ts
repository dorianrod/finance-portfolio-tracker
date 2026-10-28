export function normalizeCoveragePercentage(
  value: number | null | undefined,
): number | null {
  if (value == null || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, value))
}
