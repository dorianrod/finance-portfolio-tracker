import { describe, expect, it } from 'vitest'

import {
  RAW_OPERATION_SCHEMA,
  RAW_PORTFOLIO_HISTORY_SCHEMA,
  RAW_POSITION_SCHEMA,
} from './portfolioCsvSchemas'

const operationRow = {
  date: '2026-01-31',
  account: 'broker',
  isin: 'FR0000000001',
  ticker: 'ETF',
  name: 'ETF',
  operation_type: 'BUY',
  quantity: '2.5',
  price_per_unit: '100',
  total_amount: '250',
  currency: 'EUR',
  realized_gain: '',
}

const positionRow = {
  snapshot_date: '2026-01-31',
  account: 'broker',
  account_type: 'Brokerage',
  account_category: 'brokerage',
  isin: 'FR0000000001',
  ticker: 'ETF',
  name: 'ETF',
  quantity: '2.5',
  avg_buy_price: 100,
  last_price: '110',
  total_value: '275',
  unrealized_gain: '25',
  unrealized_gain_pct: '10',
  realized_gain: '',
  total_dividends: '',
  total_dividends_net: '',
  total_interest: '',
  total_interest_net: '',
  tax_rate: '0.3',
  unrealized_gain_net: '17.5',
  realized_gain_net: '',
  xirr: '8.2',
  xirr_rolling_3y: '',
  xirr_rolling_period_years: '',
  total_return_pct: '10',
}

describe('portfolio CSV schemas', () => {
  it('coerces operation amounts at the API boundary', async () => {
    await expect(RAW_OPERATION_SCHEMA.validate(operationRow)).resolves.toMatchObject({
      quantity: 2.5,
      price_per_unit: 100,
      total_amount: 250,
      realized_gain: 0,
    })
  })

  it('coerces position amounts and rejects malformed numbers', async () => {
    await expect(RAW_POSITION_SCHEMA.validate(positionRow)).resolves.toMatchObject({
      quantity: 2.5,
      total_value: 275,
      xirr_rolling_3y: null,
    })
    await expect(
      RAW_POSITION_SCHEMA.validate({ ...positionRow, total_value: 'invalid' }),
    ).rejects.toThrow()
  })

  it('normalizes optional history metrics to null', async () => {
    await expect(
      RAW_PORTFOLIO_HISTORY_SCHEMA.validate({
        snapshot_date: '2026-01-31',
        total_value: '1000',
        total_cost_basis: '900',
        unrealized_gain: '100',
        net_cash_injected: '900',
        cash_delta: '',
        tri: '',
        tri_rolling_1y: '4.2',
        tri_rolling_3y: '',
      }),
    ).resolves.toMatchObject({
      total_value: 1000,
      cash_delta: null,
      tri: null,
      tri_rolling_1y: 4.2,
      tri_rolling_3y: null,
    })
  })
})
