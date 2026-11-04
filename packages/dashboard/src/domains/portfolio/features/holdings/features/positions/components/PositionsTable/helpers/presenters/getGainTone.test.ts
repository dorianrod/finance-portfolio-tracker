import { describe, expect, it } from 'vitest'

import { getGainTone } from './getGainTone'

describe('getGainTone', () => {
  it('returns a muted tone for missing values', () => {
    expect(getGainTone(null)).toBe('muted')
    expect(getGainTone(undefined)).toBe('muted')
  })

  it('returns semantic positive and negative tones', () => {
    expect(getGainTone(0)).toBe('positive')
    expect(getGainTone(10)).toBe('positive')
    expect(getGainTone(-0.01)).toBe('negative')
  })
})
