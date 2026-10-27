// eslint-disable-next-line local/review-shared-feature-sharing -- Account labels and identities feed scope selection and the scope badges used by performance, wealth and quality. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import { requiredText } from './requiredText'

export const ACCOUNT_ROW_SCHEMA = yup.object({
  account: requiredText(),
  label: requiredText(),
})
