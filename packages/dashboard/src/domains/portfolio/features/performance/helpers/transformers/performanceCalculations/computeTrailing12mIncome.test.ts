import { describe, expect, it } from 'vitest'

import { computeTrailing12mIncome } from '@/domains/portfolio/features/performance/helpers/transformers/performanceCalculations/computeTrailing12mIncome'
import { group as fixtureGroupRow } from '@/domains/portfolio/shared/mocks/groupRow.mock'
import { op as fixtureOperationRow } from '@/domains/portfolio/shared/mocks/operationRow.mock'
import { position } from '@/domains/portfolio/shared/mocks/summaryPosition.mock'

describe('computeTrailing12mIncome', () => {
  it('uses the latest recorded income date as the end of its trailing window', () => {
    const p = position({
      subRows: [
        fixtureGroupRow({
          id: 'income',
          groupType: 'dividends',
          subRows: [
            fixtureOperationRow({
              id: 'old',
              date: new Date('2023-12-31'),
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 100,
            }),
            fixtureOperationRow({
              id: 'div',
              date: new Date('2024-06-01'),
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 25,
            }),
            fixtureOperationRow({
              id: 'interest',
              date: new Date('2024-12-31'),
              operation_type: 'INTEREST',
              quantity: null,
              price_per_unit: null,
              total_amount: 10,
            }),
          ],
        }),
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
        fixtureGroupRow({
          groupType: 'dividends',
          id: 'income',
          subRows: [
            fixtureOperationRow({
              id: 'previous',
              date: new Date('2024-06-01'),
              operation_type: 'DIVIDEND',
              quantity: null,
              price_per_unit: null,
              total_amount: 100,
            }),
            fixtureOperationRow({
              id: 'current',
              date: new Date('2025-06-01'),
              operation_type: 'INTEREST',
              quantity: null,
              price_per_unit: null,
              total_amount: 150,
            }),
          ],
        }),
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
