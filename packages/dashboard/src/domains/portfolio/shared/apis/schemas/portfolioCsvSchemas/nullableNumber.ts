import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const nullableNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? null : value,
  )
    .nullable()
    .default(null)
    .defined()
