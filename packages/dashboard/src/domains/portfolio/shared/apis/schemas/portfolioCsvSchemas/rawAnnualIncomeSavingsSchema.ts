import * as yup from 'yup'

import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'

import { nullableNumber } from './nullableNumber'
import { requiredNumber } from './requiredNumber'

export const RAW_ANNUAL_INCOME_SAVINGS_SCHEMA: yup.ObjectSchema<RawAnnualIncomeSavingsRow> =
  yup.object({
    year: requiredNumber(),
    income_status: yup
      .string<RawAnnualIncomeSavingsRow['income_status']>()
      .oneOf(['actual', 'forecast'])
      .required(),
    net_salary: requiredNumber(),
    other_income: requiredNumber(),
    total_income: requiredNumber(),
    gross_salary: requiredNumber(),
    placed_savings: nullableNumber(),
    savings_through: OPTIONAL_CALENDAR_DATE_SCHEMA,
    savings_status: yup
      .string<RawAnnualIncomeSavingsRow['savings_status']>()
      .oneOf(['complete', 'partial', 'missing'])
      .required(),
    placement_rate: nullableNumber(),
    unplaced_income_proxy: nullableNumber(),
    comparable: yup
      .boolean()
      .transform(
        (_value, originalValue) =>
          originalValue === true ||
          String(originalValue).trim().toLowerCase() === 'true',
      )
      .defined(),
  })
