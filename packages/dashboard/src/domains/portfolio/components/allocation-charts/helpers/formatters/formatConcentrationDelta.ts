import i18n from '@/i18n/i18n'
import type { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function formatConcentrationDelta(
  value: number | null,
  formatNumber: ReturnType<typeof useFormatNumber>,
): string {
  if (value == null) return i18n.t('ui.formatconcentrationdeltaTs.firstComparableObservation')
  const sign = value > 0 ? '+' : ''
  return i18n.t('ui.formatconcentrationdeltaTs.value0Value1PositionsVsPreviousMonth', { value0: sign, value1: formatNumber(value, { maximumFractionDigits: 0 }) })
}
