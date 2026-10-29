// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { groupMonthlyTooltipOperations } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart/helpers/aggregators/groupMonthlyTooltipOperations'
import { makeMonthlyOperation } from '@/domains/portfolio/features/wealth/mocks/monthlyOperation.mock'

import { MonthlyTooltip } from './MonthlyTooltip.view'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MonthlyTooltip', () => {
  it.each([
    { name: 'ISO date', label: '2026-01-31' },
    { name: 'Date', label: new Date('2026-01-31T00:00:00Z') },
    { name: 'timestamp', label: Date.UTC(2026, 0, 31) },
  ])(
    'resolves operations from a $name label without point metadata',
    ({ label }) => {
      render(
        <MonthlyTooltip
          active
          label={label}
          operationGroups={groupMonthlyTooltipOperations(
            new Map([
              ['2026-01', [makeMonthlyOperation({ total_amount: 100 })]],
            ]),
          )}
          payload={[{ value: 0 }]}
        />,
      )
      expect(screen.getByText('+ 100 € — Main account')).toBeTruthy()
    },
  )

  it('keeps repeated account operations distinct when the month changes', () => {
    const errors = vi.spyOn(console, 'error')
    const ops = new Map([
      [
        '2026-01',
        [
          makeMonthlyOperation({ total_amount: 100 }),
          makeMonthlyOperation({ total_amount: 200 }),
          makeMonthlyOperation({ total_amount: -50 }),
          makeMonthlyOperation({
            total_amount: 30,
            operation_type: 'WITHDRAWAL',
          }),
        ],
      ],
      [
        '2026-02',
        [
          makeMonthlyOperation({ total_amount: 400 }),
          makeMonthlyOperation({ total_amount: -90 }),
        ],
      ],
    ])
    const { rerender } = render(
      <MonthlyTooltip
        active
        label="2026-01-31"
        operationGroups={groupMonthlyTooltipOperations(ops)}
        payload={[{ value: 0 }]}
      />,
    )

    expect(screen.getByText('+ 100 € — Main account')).toBeTruthy()
    expect(screen.getByText('+ 200 € — Main account')).toBeTruthy()
    expect(screen.getByText('− 50 € — Main account')).toBeTruthy()
    expect(screen.getByText('− 30 € — Main account')).toBeTruthy()

    rerender(
      <MonthlyTooltip
        active
        label="2026-02-28"
        operationGroups={groupMonthlyTooltipOperations(ops)}
        payload={[{ value: 0 }]}
      />,
    )
    expect(screen.queryByText('+ 100 € — Main account')).toBeNull()
    expect(screen.queryByText('+ 200 € — Main account')).toBeNull()
    expect(screen.queryByText('− 50 € — Main account')).toBeNull()
    expect(screen.queryByText('− 30 € — Main account')).toBeNull()
    expect(screen.getByText('+ 400 € — Main account')).toBeTruthy()
    expect(screen.getByText('− 90 € — Main account')).toBeTruthy()
    expect(errors).not.toHaveBeenCalled()
  })
})
