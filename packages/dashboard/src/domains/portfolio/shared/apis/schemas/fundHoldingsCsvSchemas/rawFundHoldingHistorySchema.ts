import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { RAW_FUND_HOLDING_SCHEMA } from './rawFundHoldingSchema'
import { requiredText } from './requiredText'

export const RAW_FUND_HOLDING_HISTORY_SCHEMA = RAW_FUND_HOLDING_SCHEMA.shape({
  effective_date: CALENDAR_DATE_SCHEMA.required(),
  history_snapshot_id: requiredText().required(),
  captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
