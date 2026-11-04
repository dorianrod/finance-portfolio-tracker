import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const requiredNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value: unknown, originalValue: unknown) =>
    originalValue === '' || originalValue == null ? 0 : value,
  ).defined()
