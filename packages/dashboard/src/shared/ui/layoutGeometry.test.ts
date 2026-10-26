import { describe, expect, it } from 'vitest'

import { layoutShare } from './layoutGeometry'

describe('layoutShare', () => {
  it.each([
    { value: 25, total: 100, expected: 25 },
    { value: 1, total: 4, expected: 25 },
    { value: -1, total: 100, expected: 0 },
    { value: 150, total: 100, expected: 100 },
    { value: 20, total: 0, expected: 0 },
    { value: Number.NaN, total: 100, expected: 0 },
    { value: 1, total: Number.POSITIVE_INFINITY, expected: 0 },
  ])(
    'bounds $value / $total to a finite percentage',
    ({ value, total, expected }) => {
      expect(layoutShare(value, total)).toBe(expected)
    },
  )
})
