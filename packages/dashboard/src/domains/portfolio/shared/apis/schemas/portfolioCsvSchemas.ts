import * as yup from 'yup'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { RawPortfolioHistory } from '@/domains/portfolio/shared/types/rawPortfolioHistory.type'
import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import type { RawCashRow } from '@/domains/portfolio/shared/helpers/aggregators/aggregateBrokerageCash'
import type {
  RawSavingCapacityByAccountRow,
  RawSavingCapacityRow,
} from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity'

const requiredText = () => yup.string().defined()
const requiredNumber = () => yup.number().transform((value, originalValue) => (
  originalValue === '' || originalValue == null ? 0 : value
)).defined()
const nullableNumber = () => yup.number().transform((value, originalValue) => (
  originalValue === '' || originalValue == null ? null : value
)).nullable().defined()
export const ACCOUNT_ROW_SCHEMA = yup.object({
  account: requiredText(),
  label: requiredText(),
})

export const RAW_OPERATION_SCHEMA: yup.ObjectSchema<RawOperation> = yup.object({
  date: requiredText(),
  account: requiredText(),
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  operation_type: requiredText(),
  quantity: requiredNumber(),
  price_per_unit: requiredNumber(),
  total_amount: requiredNumber(),
  currency: requiredText(),
  realized_gain: requiredNumber(),
})

export const RAW_POSITION_SCHEMA: yup.ObjectSchema<RawPosition> = yup.object({
  snapshot_date: requiredText(),
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
  snapshot_date: requiredText(),
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
  snapshot_date: requiredText(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  cumulative_cash: requiredNumber(),
})

export const RAW_ANNUAL_INCOME_SAVINGS_SCHEMA: yup.ObjectSchema<RawAnnualIncomeSavingsRow> = yup.object({
  year: requiredNumber(),
  income_status: requiredText(),
  net_salary: requiredNumber(),
  other_income: requiredNumber(),
  total_income: requiredNumber(),
  gross_salary: requiredNumber(),
  placed_savings: nullableNumber(),
  savings_through: requiredText(),
  savings_status: requiredText(),
  placement_rate: nullableNumber(),
  unplaced_income_proxy: nullableNumber(),
  comparable: yup.boolean().transform((_value, originalValue) => (
    originalValue === true || String(originalValue).trim().toLowerCase() === 'true'
  )).defined(),
})

export const RAW_SAVING_CAPACITY_SCHEMA: yup.ObjectSchema<RawSavingCapacityRow> = yup.object({
  snapshot_date: requiredText(),
  savings_delta: requiredNumber(),
  perf_delta: requiredNumber(),
})

export const RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA: yup.ObjectSchema<RawSavingCapacityByAccountRow> = yup.object({
  snapshot_date: requiredText(),
  account: requiredText(),
  savings_delta: requiredNumber(),
  perf_delta: requiredNumber(),
})

const CSV_RECORD_SCHEMA: yup.MixedSchema<Record<string, string>> = yup
  .mixed<Record<string, string>>()
  .defined()
  .test('csv-record', 'CSV row must contain only string values', (value) => (
    typeof value === 'object'
      && value !== null
      && !Array.isArray(value)
      && Object.values(value).every((field) => typeof field === 'string')
  ))

export const ALLOCATION_ROW_SCHEMA: yup.MixedSchema<Record<string, string>> = CSV_RECORD_SCHEMA.test(
  'allocation-row',
  'Allocation row requires snapshot_date',
  (value) => typeof value.snapshot_date === 'string' && value.snapshot_date.length > 0,
)

export const ALLOCATION_BY_ISIN_ROW_SCHEMA: yup.MixedSchema<Record<string, string>> = ALLOCATION_ROW_SCHEMA.test(
  'allocation-by-isin-row',
  'Allocation-by-ISIN row requires isin and name',
  (value) => typeof value.isin === 'string' && typeof value.name === 'string',
)
