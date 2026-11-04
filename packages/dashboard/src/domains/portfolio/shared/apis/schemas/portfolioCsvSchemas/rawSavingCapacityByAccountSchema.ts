import * as yup from 'yup'

import type { RawSavingCapacityByAccountRow } from '@/domains/portfolio/shared/helpers/transformers/aggregateSavingCapacity/aggregateSavingCapacity.types'
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
