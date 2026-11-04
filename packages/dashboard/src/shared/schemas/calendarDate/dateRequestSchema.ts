import * as yup from 'yup'

export const DATE_REQUEST_SCHEMA = yup
  .string()
  .transform((_value, original: unknown) =>
    original instanceof Date && Number.isFinite(original.getTime())
      ? original.toISOString().slice(0, 10)
      : original,
  )
  .test('calendar-date', 'Invalid calendar date', (value) => {
    if (value == null) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  })
  .nullable()
  .defined()
