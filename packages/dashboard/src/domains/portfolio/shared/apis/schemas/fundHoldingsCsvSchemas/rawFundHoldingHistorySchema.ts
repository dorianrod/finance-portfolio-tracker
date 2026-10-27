// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { RAW_FUND_HOLDING_SCHEMA } from './rawFundHoldingSchema'
import { requiredText } from './requiredText'

export const RAW_FUND_HOLDING_HISTORY_SCHEMA = RAW_FUND_HOLDING_SCHEMA.shape({
  effective_date: CALENDAR_DATE_SCHEMA.required(),
  history_snapshot_id: requiredText().required(),
  captured_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
