import { describe, expect, it } from 'vitest'

import { pipelineReliabilityTone } from './pipelineReliabilityTone'

describe('pipeline reliability', () => {
  it('derives the portfolio status from scoped anomalies', () => {
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 0 })).toBe(
      'healthy',
    )
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 2 })).toBe(
      'warning',
    )
    expect(pipelineReliabilityTone({ errorCount: 1, warningCount: 0 })).toBe(
      'critical',
    )
  })
})
