import * as yup from 'yup'

import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { ACCOUNT_CATEGORY_SCHEMA } from './accountCategorySchema'
import { nullableNumber } from './nullableNumber'
import { requiredText } from './requiredText'

export const RAW_POSITION_SCHEMA: yup.ObjectSchema<RawPosition> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: ACCOUNT_CATEGORY_SCHEMA,
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  quantity: nullableNumber(),
  avg_buy_price: nullableNumber(),
  last_price: nullableNumber(),
  total_value: nullableNumber(),
  unrealized_gain: nullableNumber(),
  unrealized_gain_pct: nullableNumber(),
  realized_gain: nullableNumber(),
  total_dividends: nullableNumber(),
  total_dividends_net: nullableNumber(),
  total_interest: nullableNumber(),
  total_interest_net: nullableNumber(),
  tax_rate: nullableNumber(),
  unrealized_gain_net: nullableNumber(),
  realized_gain_net: nullableNumber(),
  xirr: nullableNumber(),
  xirr_rolling_3y: nullableNumber(),
  xirr_rolling_period_years: nullableNumber(),
  total_return_pct: nullableNumber(),
})
