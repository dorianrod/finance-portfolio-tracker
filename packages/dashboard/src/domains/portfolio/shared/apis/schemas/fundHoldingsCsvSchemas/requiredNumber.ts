// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import { FINITE_NUMBER_SCHEMA } from '@/shared/schemas/finiteNumber.schema'

export const requiredNumber = () =>
  FINITE_NUMBER_SCHEMA.transform((value, originalValue) =>
    originalValue === '' || originalValue == null ? 0 : value,
  ).defined()
