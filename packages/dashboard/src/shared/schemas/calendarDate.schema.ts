import * as yup from 'yup'

const DATE_ONLY = /^\d{4}-\d{2}(?:-\d{2})?$/

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

export const OPTIONAL_CALENDAR_DATE_SCHEMA =
  CALENDAR_DATE_SCHEMA.nullable().default(null)

export const DATE_FILTER_SCHEMA = CALENDAR_DATE_SCHEMA.transform(
  (value: Date | null) => value ?? undefined,
).optional()

export const DATE_REQUEST_SCHEMA = yup
  .string()
  .transform((_value, original: unknown) =>
    original instanceof Date ? original.toISOString().slice(0, 10) : original,
  )
  .nullable()
  .defined()
