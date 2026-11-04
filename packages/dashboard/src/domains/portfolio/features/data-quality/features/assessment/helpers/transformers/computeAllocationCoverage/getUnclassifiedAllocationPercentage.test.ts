import { describe, expect, it } from 'vitest'

import { getUnclassifiedAllocationPercentage } from './getUnclassifiedAllocationPercentage'

describe('getUnclassifiedAllocationPercentage', () => {
  it.each([
    { allocated: 750, unallocated: 250, expected: 25 },
    { allocated: 0, unallocated: 200, expected: 100 },
    { allocated: 200, unallocated: 0, expected: 0 },
    { allocated: 0, unallocated: 0, expected: 0 },
  ])('measures the unclassified share of $allocated + $unallocated', (item) => {
    expect(getUnclassifiedAllocationPercentage(item)).toBe(item.expected)
  })
})
