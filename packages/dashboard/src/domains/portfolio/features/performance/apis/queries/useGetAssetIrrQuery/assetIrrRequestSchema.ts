import * as yup from 'yup'

import { DATE_REQUEST_SCHEMA } from '@/shared/schemas/calendarDate/dateRequestSchema'

export const ASSET_IRR_REQUEST_SCHEMA = yup
  .object({
    accounts: yup.array(yup.string().defined()).defined(),
    account_types: yup.array(yup.string().defined()).defined(),
    date_from: DATE_REQUEST_SCHEMA,
    date_to: DATE_REQUEST_SCHEMA,
  })
  .test(
    'date-range',
    'The end date must be on or after the start date',
    (value) =>
      value.date_from == null ||
      value.date_to == null ||
      value.date_from <= value.date_to,
  )
