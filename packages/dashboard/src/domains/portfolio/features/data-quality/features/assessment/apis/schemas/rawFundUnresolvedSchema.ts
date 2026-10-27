import * as yup from 'yup'

import { requiredNumber } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/requiredNumber'
import { requiredText } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/requiredText'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'
import { CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/csvBoolean.schema'

export const RAW_FUND_UNRESOLVED_SCHEMA = yup.object({
  parent_id: requiredText(),
  parent_name: requiredText(),
  unresolved_id: requiredText(),
  unresolved_name: requiredText(),
  reason: requiredText(),
  path: requiredText(),
  weight: requiredNumber(),
  market_value: requiredNumber(),
  queued_for_research: CSV_BOOLEAN_SCHEMA,
  detected_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
})
