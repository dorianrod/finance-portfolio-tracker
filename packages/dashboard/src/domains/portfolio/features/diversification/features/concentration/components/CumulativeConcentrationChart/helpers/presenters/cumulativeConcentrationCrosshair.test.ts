import { describe, expect, it } from 'vitest'

import { cumulativeConcentrationCrosshair } from '@/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/helpers/presenters/cumulativeConcentrationCrosshair'
import { makeCumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/mocks/cumulativeConcentrationPoint.mock'

describe('cumulativeConcentrationCrosshair', () => {
  it('uses the active rank and cumulative share', () => {
    const point = makeCumulativeConcentrationPoint()

    expect(cumulativeConcentrationCrosshair(point)).toEqual({ x: 7, y: 70.5 })
    expect(cumulativeConcentrationCrosshair(null)).toBeNull()
  })
})
