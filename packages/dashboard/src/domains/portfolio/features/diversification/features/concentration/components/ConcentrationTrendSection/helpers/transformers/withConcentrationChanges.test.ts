import { describe, expect, it } from 'vitest'

import { createConcentrationHistoryPoint } from '@/domains/portfolio/features/diversification/features/concentration/mocks/concentrationHistoryPoint.mock'

import { withConcentrationChanges } from './withConcentrationChanges'

describe('withConcentrationChanges', () => {
  it('compares adjacent snapshots while preserving order and source observations', () => {
    const previous = Object.freeze(
      createConcentrationHistoryPoint({ positionsTo50Pct: null }),
    )
    const current = Object.freeze(
      createConcentrationHistoryPoint({
        date: new Date('2026-02-28'),
        positionsTo25Pct: 3,
        positionsTo50Pct: 2,
        positionsTo75Pct: null,
        positionsTo90Pct: 1,
      }),
    )
    const result = withConcentrationChanges(Object.freeze([previous, current]))

    expect(result[0]).toMatchObject({
      positionsTo25Delta: null,
      positionsTo50Delta: null,
      positionsTo75Delta: null,
      positionsTo90Delta: null,
    })
    expect(result[1]).toMatchObject({
      date: current.date,
      positionsTo25Delta: 2,
      positionsTo50Delta: null,
      positionsTo75Delta: null,
      positionsTo90Delta: -1,
    })
    expect(previous.positionsTo50Pct).toBeNull()
    expect(current.positionsTo25Pct).toBe(3)
  })

  it('keeps an empty history empty', () => {
    expect(withConcentrationChanges([])).toEqual([])
  })
})
