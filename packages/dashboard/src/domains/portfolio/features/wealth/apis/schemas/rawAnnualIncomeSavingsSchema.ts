import * as yup from 'yup'

import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/features/wealth/types/rawAnnualIncomeSavingsRow.type'
import { nullableNumber } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/nullableNumber'
import { requiredNumber } from '@/domains/portfolio/shared/apis/schemas/portfolioCsvSchemas/requiredNumber'
import { OPTIONAL_CALENDAR_DATE_SCHEMA } from '@/shared/schemas/calendarDate/optionalCalendarDateSchema'
import { CSV_BOOLEAN_SCHEMA } from '@/shared/schemas/csvBoolean.schema'

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
    comparable: CSV_BOOLEAN_SCHEMA,
  })
