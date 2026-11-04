import * as yup from 'yup'

import { DATE_ONLY } from './dateOnly'

export const CALENDAR_DATE_SCHEMA = yup
  .date()
  .transform((value: unknown, original: unknown) => {
    if (original === '' || original == null) return null
    if (typeof original === 'string' && DATE_ONLY.test(original)) {
      return new Date(
        `${original.length === 7 ? `${original}-01` : original}T00:00:00Z`,
      )
    }
    return value
  })
  .test('calendar-date', 'Invalid calendar date', (value, context) => {
    const original: unknown = context.originalValue
    return (
      typeof original !== 'string' ||
      !DATE_ONLY.test(original) ||
      value?.toISOString().slice(0, original.length) === original
    )
  })
