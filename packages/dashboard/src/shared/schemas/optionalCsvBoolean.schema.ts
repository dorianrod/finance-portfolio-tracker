import { CSV_BOOLEAN_SCHEMA } from './csvBoolean.schema'

export const OPTIONAL_CSV_BOOLEAN_SCHEMA = CSV_BOOLEAN_SCHEMA.transform(
  (value: unknown, original: unknown) =>
    original === '' || original == null ? undefined : value,
).optional()
