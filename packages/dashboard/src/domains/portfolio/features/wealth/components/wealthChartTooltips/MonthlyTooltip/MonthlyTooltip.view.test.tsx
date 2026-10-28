// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  MonthlyOperation,
  MonthlyOperationType,
} from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'

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
          ops={new Map([['2026-01', [operation(100)]]])}
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
          operation(100),
          operation(200),
          operation(-50),
          operation(30, 'WITHDRAWAL'),
        ],
      ],
      ['2026-02', [operation(400), operation(-90)]],
    ])
    const { rerender } = render(
      <MonthlyTooltip
        active
        label="2026-01-31"
        ops={ops}
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
        ops={ops}
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

function operation(
  total_amount: number,
  operation_type: MonthlyOperationType = 'DEPOSIT',
): MonthlyOperation {
  return {
    date: new Date('2026-01-15'),
    account: 'Main account',
    operation_type,
    total_amount,
  }
}
