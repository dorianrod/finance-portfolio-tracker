import { describe, expect, it } from 'vitest'

import { aggregateReliabilityTone } from './aggregateReliabilityTone'

describe('aggregate reliability', () => {
  it('aggregates the status from the weakest indicator', () => {
    expect(aggregateReliabilityTone(['healthy', 'healthy'])).toBe('healthy')
    expect(aggregateReliabilityTone(['healthy', 'warning'])).toBe('warning')
    expect(aggregateReliabilityTone(['healthy', 'critical'])).toBe('critical')
    expect(aggregateReliabilityTone(['healthy', 'healthy', 'critical'])).toBe(
      'critical',
    )
    expect(aggregateReliabilityTone(['unavailable', 'unavailable'])).toBe(
      'unavailable',
    )
  })
})
