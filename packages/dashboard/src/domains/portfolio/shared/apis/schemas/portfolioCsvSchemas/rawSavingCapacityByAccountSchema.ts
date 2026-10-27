// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import * as yup from 'yup'

import type { RawSavingCapacityByAccountRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity/aggregateSavingCapacity.types'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA: yup.ObjectSchema<RawSavingCapacityByAccountRow> =
  yup.object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    account: requiredText(),
    savings_delta: requiredNumber(),
    perf_delta: requiredNumber(),
  })
