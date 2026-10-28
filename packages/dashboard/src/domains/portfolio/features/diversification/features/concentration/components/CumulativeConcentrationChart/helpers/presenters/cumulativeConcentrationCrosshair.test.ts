import { describe, expect, it } from 'vitest'

import { cumulativeConcentrationCrosshair } from '@/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair'

describe('cumulativeConcentrationCrosshair', () => {
  it('uses the active rank and cumulative share', () => {
    const point = {
      rank: 7,
      label: 'Example asset',
      name: 'Example asset',
      value: 12_500,
      weight: 4.25,
      cumulativeWeight: 70.5,
    }

    expect(cumulativeConcentrationCrosshair(point)).toEqual({ x: 7, y: 70.5 })
    expect(cumulativeConcentrationCrosshair(null)).toBeNull()
  })
})
