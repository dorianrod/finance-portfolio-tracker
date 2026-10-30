import { describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { selectExposurePositions } from './selectExposurePositions'

describe('selectExposurePositions', () => {
  it('keeps the active investment position without changing the input', () => {
    const position = makePosition()
    const positions = [position]
    expect(selectExposurePositions(positions)).toEqual([position])
    expect(positions).toEqual([position])
  })

  it.each<Partial<PositionRow>>([
    { status: 'closed' },
    { total_value: null },
    { total_value: 0 },
    { total_value: -10 },
    { account_category: 'savings' },
    { account_category: 'checking' },
    { account_type: 'PEA – Cash' },
  ])('excludes non-invested exposure: %j', (overrides) => {
    expect(selectExposurePositions([makePosition(overrides)])).toEqual([])
  })

  it('accepts an empty scope', () => {
    expect(selectExposurePositions([])).toEqual([])
  })
})
