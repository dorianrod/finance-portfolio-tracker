// eslint-disable-next-line local/shared-feature-usage -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

export const requiredText = () => yup.string().trim().ensure().defined()
