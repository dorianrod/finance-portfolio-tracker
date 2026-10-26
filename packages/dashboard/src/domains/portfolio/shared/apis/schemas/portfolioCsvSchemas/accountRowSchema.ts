import * as yup from 'yup'

import { requiredText } from './requiredText'

export const ACCOUNT_ROW_SCHEMA = yup.object({
  account: requiredText(),
  label: requiredText(),
})
