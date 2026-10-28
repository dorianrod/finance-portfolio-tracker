// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { makeAnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/mocks/annualIncomeSavingsPoint.mock'

import { IncomeSavingsTooltip } from './IncomeSavingsTooltip.view'

afterEach(cleanup)

describe('IncomeSavingsTooltip', () => {
  it.each([
    { incomeStatus: 'actual', expected: '2026' },
    { incomeStatus: 'forecast', expected: '2026 · forecast' },
  ] as const)(
    'formats the $incomeStatus year without grouping',
    ({ incomeStatus, expected }) => {
      render(
        <IncomeSavingsTooltip
          active
          payload={[
            {
              payload: makeAnnualIncomeSavingsPoint({
                year: 2026,
                incomeStatus,
              }),
            },
          ]}
        />,
      )
      expect(screen.getByText(expected)).toBeTruthy()
    },
  )

  it.each([
    {
      savingsThrough: new Date('2026-09-30T00:00:00Z'),
      expected: '30 Sept 2026',
    },
    { savingsThrough: null, expected: '—' },
  ])(
    'formats partial savings through $expected',
    ({ savingsThrough, expected }) => {
      render(
        <IncomeSavingsTooltip
          active
          payload={[
            { payload: makeAnnualIncomeSavingsPoint({ savingsThrough }) },
          ]}
        />,
      )
      expect(
        screen.getByText(
          `Net contributions: 10,000 € · YTD through ${expected}`,
        ),
      ).toBeTruthy()
    },
  )

  it.each([
    { active: false, payload: [{ payload: makeAnnualIncomeSavingsPoint() }] },
    { active: true, payload: [] },
  ])(
    'does not display unavailable tooltip data: $active',
    ({ active, payload }) => {
      render(<IncomeSavingsTooltip active={active} payload={payload} />)
      expect(screen.queryByText(/Net contributions/)).toBeNull()
    },
  )
})
