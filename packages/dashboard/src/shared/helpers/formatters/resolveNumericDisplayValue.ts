export function resolveNumericDisplayValue(
  value: number | null | undefined,
  options: { fallback?: string | number; zeroAsFallback?: boolean } = {},
): number | string {
  const { fallback = '—', zeroAsFallback = false } = options
  return value == null || (zeroAsFallback && value === 0) ? fallback : value
}
