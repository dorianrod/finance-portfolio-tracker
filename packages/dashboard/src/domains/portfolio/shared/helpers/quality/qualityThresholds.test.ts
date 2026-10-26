import { describe, expect, it } from 'vitest'

import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds/hasMaterialQualityGap'

describe('quality gap tolerance', () => {
  it('keeps gaps below one percent healthy', () => {
    expect(hasMaterialQualityGap(0)).toBe(false)
    expect(hasMaterialQualityGap(0.99)).toBe(false)
  })

  it('flags gaps from one percent', () => {
    expect(hasMaterialQualityGap(1)).toBe(true)
    expect(hasMaterialQualityGap(12)).toBe(true)
  })
})
