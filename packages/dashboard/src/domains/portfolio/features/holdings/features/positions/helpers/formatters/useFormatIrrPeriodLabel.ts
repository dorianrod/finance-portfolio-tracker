import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useFormatIrrPeriodLabel() {
  const { t } = useTranslation()
  return useCallback(
    (
      years: number | null | undefined,
      {
        fallback = t('ui.formatirrperiodlabel.years', { value: 3 }),
      }: { fallback?: string } = {},
    ): string => {
      if (years == null) return fallback
      if (years >= 3) return t('ui.formatirrperiodlabel.years', { value: 3 })
      if (years >= 1)
        return t('ui.formatirrperiodlabel.years', {
          value: Math.floor(years * 10) / 10,
        })
      return t('ui.formatirrperiodlabel.months', {
        value: Math.max(1, Math.round(years * 12)),
      })
    },
    [t],
  )
}
