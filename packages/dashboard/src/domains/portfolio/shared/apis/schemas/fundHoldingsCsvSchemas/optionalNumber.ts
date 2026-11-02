import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const optionalNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value: unknown, originalValue: unknown) =>
    originalValue === '' || originalValue == null ? undefined : value,
  ).optional()
