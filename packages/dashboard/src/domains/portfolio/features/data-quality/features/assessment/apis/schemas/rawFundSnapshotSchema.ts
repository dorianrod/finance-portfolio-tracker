import * as yup from 'yup'

import { requiredNumber } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/requiredNumber'
import { requiredText } from '@/domains/portfolio/shared/apis/schemas/fundHoldingsCsvSchemas/requiredText'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'
import { CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/csvBoolean.schema'

export const RAW_FUND_SNAPSHOT_SCHEMA = yup.object({
  fund_id: requiredText(),
  fund_name: requiredText(),
  snapshot_id: requiredText(),
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  as_of_date: CALENDAR_DATE_SCHEMA.required(),
  generated_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  origin: requiredText(),
  status: requiredText(),
  is_active: CSV_BOOLEAN_SCHEMA,
  is_stale: CSV_BOOLEAN_SCHEMA,
  age_days: requiredNumber(),
  holding_count: requiredNumber(),
  weight_sum: requiredNumber(),
  coverage_pct: requiredNumber(),
  complete: CSV_BOOLEAN_SCHEMA,
  source_urls: requiredText(),
  evidence_path: requiredText(),
  holdings_path: requiredText(),
  checksum_sha256: requiredText(),
  notes: requiredText(),
  validation_errors: requiredText(),
})
