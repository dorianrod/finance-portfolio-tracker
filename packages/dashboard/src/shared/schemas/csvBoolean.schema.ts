import * as yup from 'yup'

export const CSV_BOOLEAN_SCHEMA = yup
  .boolean()
  .transform((value: unknown, original: unknown) => {
    if (typeof original !== 'string') return value
    const normalized = original.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
    return value
  })
  .defined()
