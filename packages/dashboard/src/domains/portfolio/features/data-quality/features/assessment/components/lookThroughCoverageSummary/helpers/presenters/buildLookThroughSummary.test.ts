import { describe, expect, it } from 'vitest'

import { makeFundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/mocks/fundCoverageReport.mock'

import { buildLookThroughSummary } from './buildLookThroughSummary'

describe('buildLookThroughSummary', () => {
  it.each([
    {
      undisclosedFundValue: 0,
      opaqueValue: 0,
      undisclosedTone: 'coverage',
      opaqueTone: 'coverage',
    },
    {
      undisclosedFundValue: 100,
      opaqueValue: 100,
      undisclosedTone: 'warning',
      opaqueTone: 'error',
    },
  ])(
    'keeps visual tones for exposure $undisclosedFundValue/$opaqueValue',
    ({ undisclosedFundValue, opaqueValue, undisclosedTone, opaqueTone }) => {
      const result = buildLookThroughSummary(
        makeFundCoverageReport({ undisclosedFundValue, opaqueValue }),
        0,
      )
      expect(result.undisclosedTone).toBe(undisclosedTone)
      expect(result.opaqueTone).toBe(opaqueTone)
      expect(result.identifiedValue).toBe(1000)
    },
  )
})
