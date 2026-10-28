import { describe, expect, it } from 'vitest'

import { percentageReliabilityTone } from './percentageReliabilityTone'

describe('percentage reliability', () => {
  it('assigns tones independently from the reliability percentage', () => {
    expect(percentageReliabilityTone(100)).toBe('healthy')
    expect(percentageReliabilityTone(99.1)).toBe('healthy')
    expect(percentageReliabilityTone(99)).toBe('warning')
    expect(percentageReliabilityTone(80)).toBe('warning')
    expect(percentageReliabilityTone(54)).toBe('critical')
    expect(percentageReliabilityTone(null)).toBe('unavailable')
  })
})
