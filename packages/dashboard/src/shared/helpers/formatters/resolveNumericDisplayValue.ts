export function resolveNumericDisplayValue(
  value: number | null | undefined,
  options: NumericDisplayOptions = {},
): number | string {
  const { fallback = '—', zeroAsFallback = false } = options
  return value == null || (zeroAsFallback && value === 0) ? fallback : value
}

export type NumericDisplayOptions = {
  fallback?: string | number
  zeroAsFallback?: boolean
}
