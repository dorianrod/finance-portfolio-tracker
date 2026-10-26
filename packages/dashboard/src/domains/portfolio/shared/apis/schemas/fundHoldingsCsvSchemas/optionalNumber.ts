import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const optionalNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? undefined : value,
  ).optional()
