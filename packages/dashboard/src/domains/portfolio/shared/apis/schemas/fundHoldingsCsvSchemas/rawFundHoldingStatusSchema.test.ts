import { describe, expect, it } from 'vitest'

import { fundHoldingStatusRow } from '@/domains/portfolio/shared/mocks/fundHoldingStatusRow.mock'

import { RAW_FUND_HOLDING_STATUS_SCHEMA } from './rawFundHoldingStatusSchema'

describe('fund holding status normalization', () => {
  it.each(['', null, undefined])(
    'normalizes missing status fields represented by %s',
    (value) => {
      const status = RAW_FUND_HOLDING_STATUS_SCHEMA.validateSync({
        ...fundHoldingStatusRow(),
        quality_tier: value,
        validation_status: value,
        decomposition_state: value,
        manual_attention: value,
      })

      expect(status).toMatchObject({
        quality_tier: 'D',
        validation_status: 'error',
        decomposition_state: 'unresolved',
        manual_attention: false,
      })
    },
  )

  it('preserves supplied statuses and explicit attention', () => {
    const source = { ...fundHoldingStatusRow(), manual_attention: true }
    expect(RAW_FUND_HOLDING_STATUS_SCHEMA.validateSync(source)).toEqual(source)
  })

  it('rejects an unknown logic-driving tier', () => {
    expect(() =>
      RAW_FUND_HOLDING_STATUS_SCHEMA.validateSync({
        ...fundHoldingStatusRow(),
        quality_tier: 'unrecognized',
      }),
    ).toThrow()
  })
})
