import { describe, expect, it } from 'vitest'
import {
  aggregateReliabilityTone,
  percentageReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
} from './analysisReliability'

describe('analysis reliability', () => {
  it('assigns tones independently from the reliability percentage', () => {
    expect(percentageReliabilityTone(100)).toBe('healthy')
    expect(percentageReliabilityTone(99.1)).toBe('healthy')
    expect(percentageReliabilityTone(99)).toBe('warning')
    expect(percentageReliabilityTone(80)).toBe('warning')
    expect(percentageReliabilityTone(54)).toBe('critical')
    expect(percentageReliabilityTone(null)).toBe('unavailable')
  })

  it('aggregates the status from the weakest indicator', () => {
    expect(aggregateReliabilityTone(['healthy', 'healthy'])).toBe('healthy')
    expect(aggregateReliabilityTone(['healthy', 'warning'])).toBe('warning')
    expect(aggregateReliabilityTone(['healthy', 'critical'])).toBe('critical')
    expect(aggregateReliabilityTone(['healthy', 'healthy', 'critical'])).toBe('critical')
    expect(aggregateReliabilityTone(['unavailable', 'unavailable'])).toBe('unavailable')
  })

  it('derives the portfolio status from scoped anomalies', () => {
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 0 })).toBe('healthy')
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 2 })).toBe('warning')
    expect(pipelineReliabilityTone({ errorCount: 1, warningCount: 0 })).toBe('critical')
    expect(pipelineStatusLabel({ errorCount: 0, warningCount: 0 })).toBe('No anomaly')
    expect(pipelineStatusLabel({ errorCount: 0, warningCount: 2 })).toBe('2 anomalies')
  })
})
