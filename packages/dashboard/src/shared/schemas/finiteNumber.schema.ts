import { number } from 'yup'

import i18n from '@/i18n/i18n'

export const FINITE_NUMBER_SCHEMA = number().test({
  name: 'finite',
  message: () => i18n.t('ui.errors.invalidData'),
  skipAbsent: true,
  test: Number.isFinite,
})
