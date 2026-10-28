// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { makeIsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/mocks/isinAllocation.mock'
import { makePositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/mocks/positionPreviewSelection.mock'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { resolvePositionPreview } from './resolvePositionPreview'

describe('resolvePositionPreview', () => {
  it.each([
    {
      kind: 'chart',
      expected: {
        kind: 'chart',
        target: { name: 'Asset', isin: 'FR0000000001', operations: [] },
      },
    },
    {
      kind: 'savings',
      expected: { kind: 'savings', target: { name: 'Asset', operations: [] } },
    },
    {
      kind: 'allocation',
      expected: {
        kind: 'allocation',
        target: { name: 'Asset', isin: 'FR0000000001' },
      },
    },
    {
      kind: 'underlying',
      expected: {
        kind: 'underlying',
        target: {
          position: { id: 'asset-1' },
          status: { parentIsin: 'FR0000000001' },
        },
      },
    },
  ] as const)(
    'resolves the current $kind data from a selection',
    ({ kind, expected }) => {
      const allocation = makeIsinAllocation()
      expect(
        resolvePositionPreview(
          makePositionPreviewSelection({ kind }),
          [makePosition()],
          [makeFundHoldingStatus()],
          new Map([[allocation.isin, allocation]]),
        ),
      ).toMatchObject(expected)
    },
  )

  it.each([
    { selection: null, positions: [makePosition()] },
    {
      selection: makePositionPreviewSelection({ positionId: 'missing' }),
      positions: [makePosition()],
    },
    { selection: makePositionPreviewSelection(), positions: [] },
    {
      selection: makePositionPreviewSelection({ kind: 'chart' }),
      positions: [makePosition({ isin: '', ticker: '', name: '' })],
    },
    {
      selection: makePositionPreviewSelection({ kind: 'allocation' }),
      positions: [makePosition()],
    },
    {
      selection: makePositionPreviewSelection({ kind: 'underlying' }),
      positions: [makePosition()],
    },
  ])(
    'does not invent data for an unavailable selection $selection',
    ({ selection, positions }) => {
      expect(
        resolvePositionPreview(selection, positions, [], new Map()),
      ).toBeNull()
    },
  )
})
