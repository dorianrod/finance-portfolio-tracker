// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Cash-enriched history feeds wealth analysis, performance and overview comparisons through useDashboardHistory. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { RawCashRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { ACCOUNT_CATEGORY_SCHEMA } from './accountCategorySchema'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_CASH_ROW_SCHEMA: yup.ObjectSchema<RawCashRow> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: ACCOUNT_CATEGORY_SCHEMA,
  cumulative_cash: requiredNumber(),
})
