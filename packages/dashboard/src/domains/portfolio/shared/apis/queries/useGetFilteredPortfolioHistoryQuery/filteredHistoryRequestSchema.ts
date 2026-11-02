import * as yup from 'yup'

export const FILTERED_HISTORY_REQUEST_SCHEMA = yup.object({
  accounts: yup.array(yup.string().defined()).defined(),
})
