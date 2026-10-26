import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const requiredNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? 0 : value,
  ).defined()
