// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const optionalNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? undefined : value,
  ).optional()
