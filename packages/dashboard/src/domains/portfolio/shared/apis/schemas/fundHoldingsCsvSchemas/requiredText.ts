// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

export const requiredText = () => yup.string().trim().ensure().defined()
