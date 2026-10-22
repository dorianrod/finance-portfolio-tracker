import * as yup from 'yup'
import type { RawOperation, RawPosition } from '@/domains/portfolio/types/domain'
import type { RawPortfolioHistory } from '@/domains/portfolio/types/history'
import type { RawAnnualIncomeSavingsRow } from '@/domains/portfolio/helpers/annualIncomeSavings.logic'
import type { RawCashRow } from '@/domains/portfolio/helpers/cashHistory.logic'
import type {
  RawSavingCapacityByAccountRow,
  RawSavingCapacityRow,
} from '@/domains/portfolio/helpers/savingCapacity.logic'

const requiredText = () => yup.string().defined()
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
  quantity: requiredText(),
  price_per_unit: requiredText(),
  total_amount: requiredText(),
  currency: requiredText(),
  realized_gain: requiredText(),
})

export const RAW_POSITION_SCHEMA: yup.ObjectSchema<RawPosition> = yup.object({
  snapshot_date: requiredText(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  isin: requiredText(),
  ticker: requiredText(),
  name: requiredText(),
  quantity: requiredText(),
  avg_buy_price: requiredText(),
  last_price: requiredText(),
  total_value: requiredText(),
  unrealized_gain: requiredText(),
  unrealized_gain_pct: requiredText(),
  realized_gain: requiredText(),
  total_dividends: requiredText(),
  total_dividends_net: requiredText(),
  total_interest: requiredText(),
  total_interest_net: requiredText(),
  tax_rate: requiredText(),
  unrealized_gain_net: requiredText(),
  realized_gain_net: requiredText(),
  xirr: requiredText(),
  xirr_rolling_3y: requiredText(),
  xirr_rolling_period_years: requiredText(),
  total_return_pct: requiredText(),
})

export const RAW_PORTFOLIO_HISTORY_SCHEMA: yup.ObjectSchema<RawPortfolioHistory> = yup.object({
  snapshot_date: requiredText(),
  total_value: requiredText(),
  total_cost_basis: requiredText(),
  unrealized_gain: requiredText(),
  net_cash_injected: requiredText(),
  cash_delta: requiredText(),
  tri: requiredText(),
  tri_rolling_1y: requiredText(),
  tri_rolling_3y: requiredText(),
})

export const RAW_CASH_ROW_SCHEMA: yup.ObjectSchema<RawCashRow> = yup.object({
  snapshot_date: requiredText(),
  account: requiredText(),
  account_type: requiredText(),
  account_category: requiredText(),
  cumulative_cash: requiredText(),
})

export const RAW_ANNUAL_INCOME_SAVINGS_SCHEMA: yup.ObjectSchema<RawAnnualIncomeSavingsRow> = yup.object({
  year: requiredText(),
  income_status: requiredText(),
  net_salary: requiredText(),
  other_income: requiredText(),
  total_income: requiredText(),
  gross_salary: requiredText(),
  placed_savings: requiredText(),
  savings_through: requiredText(),
  savings_status: requiredText(),
  placement_rate: requiredText(),
  unplaced_income_proxy: requiredText(),
  comparable: requiredText(),
})

export const RAW_SAVING_CAPACITY_SCHEMA: yup.ObjectSchema<RawSavingCapacityRow> = yup.object({
  snapshot_date: requiredText(),
  savings_delta: requiredText(),
  perf_delta: requiredText(),
})

export const RAW_SAVING_CAPACITY_BY_ACCOUNT_SCHEMA: yup.ObjectSchema<RawSavingCapacityByAccountRow> = yup.object({
  snapshot_date: requiredText(),
  account: requiredText(),
  savings_delta: requiredText(),
  perf_delta: requiredText(),
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
