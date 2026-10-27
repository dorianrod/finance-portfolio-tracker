// eslint-disable-next-line local/review-shared-feature-sharing -- Validated fund inputs feed holdings inspection, overview comparisons, diversification and quality assessment through the shell. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { requiredBoolean } from './requiredBoolean'
import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_FUND_SNAPSHOT_SCHEMA = yup.object({
  fund_id: requiredText(),
  fund_name: requiredText(),
  snapshot_id: requiredText(),
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  as_of_date: CALENDAR_DATE_SCHEMA.required(),
  generated_at: OPTIONAL_CALENDAR_DATE_SCHEMA,
  origin: requiredText(),
  status: requiredText(),
  is_active: requiredBoolean(),
  is_stale: requiredBoolean(),
  age_days: requiredNumber(),
  holding_count: requiredNumber(),
  weight_sum: requiredNumber(),
  coverage_pct: requiredNumber(),
  complete: requiredBoolean(),
  source_urls: requiredText(),
  evidence_path: requiredText(),
  holdings_path: requiredText(),
  checksum_sha256: requiredText(),
  notes: requiredText(),
  validation_errors: requiredText(),
})
