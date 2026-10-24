import { describe, expect, it } from 'vitest'

import { gainClass } from './getGainClass'

describe('gainClass', () => {
  it('returns a neutral class for null/undefined', () => {
    expect(gainClass(null)).toBe('text-content-muted')
    expect(gainClass(undefined)).toBe('text-content-muted')
  })

  it('returns green for zero or positive values, red for negative', () => {
    expect(gainClass(0)).toBe('text-positive')
    expect(gainClass(10)).toBe('text-positive')
    expect(gainClass(-0.01)).toBe('text-danger')
  })
})
