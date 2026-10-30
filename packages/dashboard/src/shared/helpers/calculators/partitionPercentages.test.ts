import { describe, expect, it } from 'vitest'

import { partitionPercentages } from './partitionPercentages'

describe('partitionPercentages', () => {
  it.each([
    [
      [Number.MAX_VALUE, Number.MAX_VALUE],
      [50, 50],
    ],
    [
      [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
      [33.4, 33.3, 33.3],
    ],
    [
      [Number.MIN_VALUE, Number.MIN_VALUE],
      [50, 50],
    ],
  ])(
    'conserves shares for finite values at numerical extremes: %j',
    (values, expected) => {
      expect(partitionPercentages(values)).toEqual(expected)
    },
  )

  it('returns exclusive one-decimal shares that add up to exactly 100%', () => {
    const percentages = partitionPercentages([1, 1, 1])

    expect(percentages).toEqual([33.4, 33.3, 33.3])
    expect(
      percentages.reduce((sum, value) => sum + Math.round(value * 10), 0),
    ).toBe(1_000)
  })

  it('uses the same total for applicable and not-applicable values', () => {
    expect(partitionPercentages([900, 100, 2_400])).toEqual([26.5, 2.9, 70.6])
  })

  it('normalizes invalid values and handles an empty partition', () => {
    expect(
      partitionPercentages([Number.NaN, -5, Number.POSITIVE_INFINITY]),
    ).toEqual([0, 0, 0])
  })
})
