import { describe, expect, it } from 'vitest'

import { summarizeAllocationCoverage } from './summarizeAllocationCoverage'

describe('allocation coverage summary', () => {
  it('conserves selected value and partitions rounded percentages to 100% within numeric precision', () => {
    const result = summarizeAllocationCoverage([
      { allocated: 1, unallocated: 1, notApplicable: 1 },
      { allocated: 1, unallocated: 1, notApplicable: 1 },
    ])
    expect(result.total).toBe(6)
    expect(result.allocated).toBe(2)
    expect(result.unallocated).toBe(2)
    expect(result.notApplicable).toBe(2)
    expect(
      result.allocatedPct + result.unallocatedPct + result.notApplicablePct,
    ).toBeCloseTo(100, 10)
  })

  it('keeps a scope with no value empty', () => {
    expect(summarizeAllocationCoverage([])).toEqual({
      allocated: 0,
      unallocated: 0,
      notApplicable: 0,
      total: 0,
      allocatedPct: 0,
      unallocatedPct: 0,
      notApplicablePct: 0,
    })
  })
})
