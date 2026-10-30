import { describe, expect, it } from 'vitest'

import { getFundQualityCategory } from './getFundQualityCategory'

describe('getFundQualityCategory', () => {
  it.each([
    ['A', 'reliable'],
    ['B', 'reliable'],
    ['C', 'partial'],
    ['D', 'unavailable'],
  ] as const)('classifies %s as %s', (tier, expected) => {
    expect(getFundQualityCategory(tier)).toBe(expected)
  })
})
