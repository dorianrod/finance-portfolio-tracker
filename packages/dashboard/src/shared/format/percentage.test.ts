import { describe, expect, it } from 'vitest'
import { formatPercentage, partitionPercentages } from './percentage'

describe('formatPercentage', () => {
  it('always displays one decimal place', () => {
    expect(formatPercentage(0)).toBe('0.0')
    expect(formatPercentage(0.04)).toBe('0.0')
    expect(formatPercentage(12.36)).toBe('12.4')
    expect(formatPercentage(100)).toBe('100.0')
  })

  it('falls back to zero for non-finite values', () => {
    expect(formatPercentage(Number.NaN)).toBe('0.0')
    expect(formatPercentage(Number.POSITIVE_INFINITY)).toBe('0.0')
  })
})

describe('partitionPercentages', () => {
  it('returns exclusive one-decimal shares that add up to exactly 100%', () => {
    const percentages = partitionPercentages([1, 1, 1])

    expect(percentages).toEqual([33.4, 33.3, 33.3])
    expect(percentages.reduce((sum, value) => sum + Math.round(value * 10), 0)).toBe(1_000)
  })

  it('uses the same total for applicable and not-applicable values', () => {
    expect(partitionPercentages([900, 100, 2_400])).toEqual([26.5, 2.9, 70.6])
  })

  it('normalizes invalid values and handles an empty partition', () => {
    expect(partitionPercentages([Number.NaN, -5, Number.POSITIVE_INFINITY])).toEqual([0, 0, 0])
  })
})
