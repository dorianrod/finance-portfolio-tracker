import i18n from '@/i18n/i18n'

export function formatIrrPeriodLabel(years: number | null): string {
  if (years == null || years >= 3) return i18n.t('ui.formatirrperiodlabel.years', { value: 3 })
  if (years >= 1) return i18n.t('ui.formatirrperiodlabel.years', { value: Math.floor(years * 10) / 10 })
  return i18n.t('ui.formatirrperiodlabel.months', { value: Math.max(1, Math.round(years * 12)) })
}
