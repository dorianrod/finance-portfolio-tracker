// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PositionRowSurface } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableAppearance/PositionRowSurface.view'
import { TransactionBadge } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableAppearance/TransactionBadge.view'

afterEach(cleanup)

describe('position table appearance', () => {
  it.each([
    {
      kind: 'position' as const,
      closed: false,
    },
    {
      kind: 'group' as const,
      closed: false,
    },
    {
      kind: 'detail' as const,
      closed: false,
    },
    {
      kind: 'position' as const,
      closed: true,
    },
  ])(
    'preserves table semantics for $kind closed=$closed',
    ({ kind, closed }) => {
      render(
        <table>
          <tbody>
            <PositionRowSurface kind={kind} closed={closed}>
              <td>Row</td>
            </PositionRowSurface>
          </tbody>
        </table>,
      )
      expect(screen.getByRole('row', { name: 'Row' })).toBeTruthy()
      expect(screen.getByRole('cell', { name: 'Row' })).toBeTruthy()
    },
  )

  it.each([
    { kind: 'buy' as const },
    { kind: 'sell' as const },
    { kind: 'other' as const },
  ])('preserves the $kind operation label', ({ kind }) => {
    render(<TransactionBadge kind={kind}>Operation</TransactionBadge>)
    expect(screen.getByText('Operation')).toBeTruthy()
  })
})
