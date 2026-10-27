// eslint-disable-next-line local/review-shared-feature-sharing -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { requiredBoolean } from './requiredBoolean'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_FUND_UNRESOLVED_SCHEMA = yup.object({
  parent_id: requiredText(),
  parent_name: requiredText(),
  unresolved_id: requiredText(),
  unresolved_name: requiredText(),
  reason: requiredText(),
  path: requiredText(),
  weight: requiredNumber(),
  market_value: requiredNumber(),
  queued_for_research: requiredBoolean(),
  detected_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
