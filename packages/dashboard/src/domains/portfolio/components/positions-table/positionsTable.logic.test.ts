import { describe, it, expect } from 'vitest'
import { gainClass } from './positionsTable.logic'

describe('gainClass', () => {
  it('returns a neutral class for null/undefined', () => {
    expect(gainClass(null)).toBe('text-gray-400')
    expect(gainClass(undefined)).toBe('text-gray-400')
  })

  it('returns green for zero or positive values, red for negative', () => {
    expect(gainClass(0)).toBe('text-emerald-400')
    expect(gainClass(10)).toBe('text-emerald-400')
    expect(gainClass(-0.01)).toBe('text-red-400')
  })
})
