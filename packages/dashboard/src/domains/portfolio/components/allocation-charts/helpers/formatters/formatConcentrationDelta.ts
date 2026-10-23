import type { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function formatConcentrationDelta(
  value: number | null,
  formatNumber: ReturnType<typeof useFormatNumber>,
): string {
  if (value == null) return 'First comparable observation'
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatNumber(value, { maximumFractionDigits: 0 })} positions vs previous month`
}
