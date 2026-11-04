import { describe, expect, it } from 'vitest'

import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'

import { getPositionAllocationKey } from './getPositionAllocationKey'

describe('getPositionAllocationKey', () => {
  it.each([
    { isin: 'FR0000000001', name: 'Asset', expected: 'FR0000000001' },
    { isin: '', name: 'Asset', expected: 'NC-Asset' },
    { isin: '', name: '', expected: 'NC-' },
  ])('uses the allocation identity $expected', ({ isin, name, expected }) => {
    expect(getPositionAllocationKey(makePosition({ isin, name }))).toBe(
      expected,
    )
  })
})
