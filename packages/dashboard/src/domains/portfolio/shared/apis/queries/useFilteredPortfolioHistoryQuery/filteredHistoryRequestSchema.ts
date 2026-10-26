// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

export const FILTERED_HISTORY_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
})
