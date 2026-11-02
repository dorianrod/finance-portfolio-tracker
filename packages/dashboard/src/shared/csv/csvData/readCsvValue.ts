import type { Schema } from 'yup'

export function readCsvValue<T>(schema: Schema<T>, value: unknown): T {
  if (import.meta.env['DEBUG'] === 'false') {
    return schema.cast(value, { stripUnknown: true })
  }
  return schema.validateSync(value, { stripUnknown: true })
}
