// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

export const requiredBoolean = () =>
  yup
    .boolean()
    .transform(
      (_value, originalValue) =>
        originalValue === true ||
        String(originalValue).trim().toLowerCase() === 'true',
    )
    .defined()
