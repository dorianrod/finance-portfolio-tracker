// eslint-disable-next-line local/review-shared-feature-sharing -- The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { RawSavingCapacityRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity/aggregateSavingCapacity.types'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { requiredNumber } from './requiredNumber'

export const RAW_SAVING_CAPACITY_SCHEMA: yup.ObjectSchema<RawSavingCapacityRow> =
  yup.object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    savings_delta: requiredNumber(),
    perf_delta: requiredNumber(),
  })
