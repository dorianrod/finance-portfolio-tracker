import { describe, expect, it } from 'vitest'

import { computeTrailing12mIncome } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/computeTrailing12mIncome'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computeTrailing12mIncome', () => {
  it('uses the latest recorded income date as the end of its trailing window', () => {
    const p = position({
      subRows: [
        {
          kind: 'group',
          id: 'income',
          groupType: 'dividends',
          subRows: [
            {
              kind: 'operation',
              id: 'old',
              date: new Date('2023-12-31'),
              account: 'acc1',
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 100,
              realized_gain: null,
            },
            {
              kind: 'operation',
              id: 'div',
              date: new Date('2024-06-01'),
              account: 'acc1',
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 25,
              realized_gain: null,
            },
            {
              kind: 'operation',
              id: 'interest',
              date: new Date('2024-12-31'),
              account: 'acc1',
              operation_type: 'INTEREST',
              quantity: null,
              price_per_unit: null,
              total_amount: 10,
              realized_gain: null,
            },
          ],
        },
      ],
    })
    expect(computeTrailing12mIncome([p])).toEqual({
      dividends: 25,
      interest: 10,
      total: 35,
      previousTotal: 100,
      changePct: -65,
      dateFrom: new Date('2023-12-31'),
      dateTo: new Date('2024-12-31'),
    })
  })

  it('anchors both rolling income windows to the supplied portfolio date', () => {
    const p = position({
      subRows: [
        {
          kind: 'group',
          groupType: 'dividends',
          id: 'income',
          subRows: [
            {
              kind: 'operation',
              id: 'previous',
              date: new Date('2024-06-01'),
              account: 'acc1',
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 100,
              realized_gain: null,
            },
            {
              kind: 'operation',
              id: 'current',
              date: new Date('2025-06-01'),
              account: 'acc1',
              operation_type: 'INTEREST',
              quantity: null,
              price_per_unit: null,
              total_amount: 150,
              realized_gain: null,
            },
          ],
        },
      ],
    })

    expect(computeTrailing12mIncome([p], new Date('2025-12-31'))).toMatchObject(
      {
        total: 150,
        previousTotal: 100,
        changePct: 50,
        dateFrom: new Date('2024-12-31'),
        dateTo: new Date('2025-12-31'),
      },
    )
  })
})
