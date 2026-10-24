import type { RawCashRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import type {
  RawSavingCapacityByAccountRow,
  RawSavingCapacityRow,
} from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity'
import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import {
  ALL_OPERATION_TYPES,
  type OperationType,
} from '@/domains/portfolio/shared/types/operationType.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPortfolioHistory } from '@/domains/portfolio/shared/types/rawPortfolioHistory.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import {
  CALENDAR_DATE_SCHEMA,
  OPTIONAL_CALENDAR_DATE_SCHEMA,
} from '@/shared/schemas/calendarDate.schema'
import * as yup from 'yup'

const requiredText = () => yup.string().defined()
const requiredNumber = () =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null ? 0 : value,
    )
    .defined()
    .test('finite', 'Amount must be finite', Number.isFinite)
const nullableNumber = () =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null ? null : value,
    )
    .nullable()
    .default(null)
    .defined()
    .test('finite', 'Amount must be finite', (value) => value === null || Number.isFinite(value))
export const ACCOUNT_ROW_SCHEMA = yup.object({
  account: requiredText(),
  label: requiredText(),
})

export const RAW_OPERATION_SCHEMA: yup.ObjectSchema<RawOperation> = yup.object({
  date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  operation_type: yup.mixed<OperationType>().oneOf(ALL_OPERATION_TYPES).required(),
  quantity: requiredNumber(),
  price_per_unit: requiredNumber(),
  total_amount: requiredNumber(),
  currency: requiredText(),
  realized_gain: requiredNumber(),
})

export const RAW_POSITION_SCHEMA: yup.ObjectSchema<RawPosition> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  quantity: nullableNumber(),
  avg_buy_price: nullableNumber(),
  last_price: nullableNumber(),
  total_value: nullableNumber(),
  unrealized_gain: nullableNumber(),
  unrealized_gain_pct: nullableNumber(),
  realized_gain: nullableNumber(),
  total_dividends: nullableNumber(),
  total_dividends_net: nullableNumber(),
  total_interest: nullableNumber(),
  total_interest_net: nullableNumber(),
  tax_rate: nullableNumber(),
  unrealized_gain_net: nullableNumber(),
  realized_gain_net: nullableNumber(),
  xirr: nullableNumber(),
  xirr_rolling_3y: nullableNumber(),
  xirr_rolling_period_years: nullableNumber(),
  total_return_pct: nullableNumber(),
})

export const RAW_PORTFOLIO_HISTORY_SCHEMA: yup.ObjectSchema<RawPortfolioHistory> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  total_value: requiredNumber(),
  total_cost_basis: requiredNumber(),
  unrealized_gain: requiredNumber(),
  net_cash_injected: requiredNumber(),
  cash_delta: nullableNumber(),
  tri: nullableNumber(),
  tri_rolling_1y: nullableNumber(),
  tri_rolling_3y: nullableNumber(),
})

export const RAW_CASH_ROW_SCHEMA: yup.ObjectSchema<RawCashRow> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  cumulative_cash: requiredNumber(),
})

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
          originalValue === true || String(originalValue).trim().toLowerCase() === 'true',
      )
      .defined(),
  })

export const RAW_SAVING_CAPACITY_SCHEMA: yup.ObjectSchema<RawSavingCapacityRow> = yup.object({
  snapshot_date: CALENDAR_DATE_SCHEMA.required(),
  savings_delta: requiredNumber(),
  perf_delta: requiredNumber(),
})

export const RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA: yup.ObjectSchema<RawSavingCapacityByAccountRow> =
  yup.object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    account: requiredText(),
    savings_delta: requiredNumber(),
    perf_delta: requiredNumber(),
  })

const ALLOCATION_METADATA_COLUMNS = new Set([
  'snapshot_date',
  'account',
  'account_type',
  'isin',
  'name',
])

const ALLOCATION_VALUES_SCHEMA = yup
  .mixed<Record<string, number>>()
  .defined()
  .test(
    'allocation-values',
    'Allocation values must be finite numbers',
    (values) =>
      typeof values === 'object' &&
      values !== null &&
      !Array.isArray(values) &&
      Object.values(values).every((value) => typeof value === 'number' && Number.isFinite(value)),
  )

export const ALLOCATION_BY_ISIN_ROW_SCHEMA: yup.ObjectSchema<RawIsinRow> = yup
  .object({
    snapshot_date: CALENDAR_DATE_SCHEMA.required(),
    account: yup.string().optional(),
    account_type: yup.string().optional(),
    isin: yup.string().defined(),
    name: yup.string().defined(),
    values: ALLOCATION_VALUES_SCHEMA,
  })
  .transform((row: unknown) => {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) return row
    const source = row as Record<string, unknown>
    const values = Object.fromEntries(
      Object.entries(source)
        .filter(([key]) => !ALLOCATION_METADATA_COLUMNS.has(key))
        .map(([key, value]) => [key, Number(value)] as const)
        .filter(([, value]) => !Number.isFinite(value) || value > 0),
    )
    return {
      snapshot_date: source.snapshot_date,
      account: source.account || undefined,
      account_type: source.account_type || undefined,
      isin: source.isin,
      name: source.name,
      values,
    }
  })
