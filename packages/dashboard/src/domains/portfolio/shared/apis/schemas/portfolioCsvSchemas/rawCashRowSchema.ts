import * as yup from 'yup'

import type { RawCashRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_CASH_ROW_SCHEMA: yup.ObjectSchema<RawCashRow> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  cumulative_cash: requiredNumber(),
})
