import * as yup from 'yup'

import {
  ALL_OPERATION_TYPES,
  type OperationType,
} from '@/domains/portfolio/shared/types/operationType.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import { CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/calendarDateSchema'

import { requiredNumber } from './requiredNumber'
import { requiredText } from './requiredText'

export const RAW_OPERATION_SCHEMA: yup.ObjectSchema<RawOperation> = yup.object({
  date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  operation_type: yup
    .mixed<OperationType>()
    .oneOf(ALL_OPERATION_TYPES)
    .required(),
  quantity: requiredNumber(),
  price_per_unit: requiredNumber(),
  total_amount: requiredNumber(),
  currency: requiredText(),
  realized_gain: requiredNumber(),
})
