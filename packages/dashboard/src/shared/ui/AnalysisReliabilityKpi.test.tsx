import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
  aggregateReliabilityTone,
  percentageReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
} from './AnalysisReliabilityKpi'

describe('CombinedAnalysisReliabilityKpi', () => {
  it('shows an aggregate status while retaining each analysis color and name', () => {
    const html = renderToStaticMarkup(
      <CombinedAnalysisReliabilityKpi
        statusMetric={{ value: 'No anomaly', metricLabel: 'Portfolio data', tone: 'healthy' }}
        metrics={[
          { percentage: 100, amount: 120_000, metricLabel: 'Diversification', tone: 'healthy' },
          { percentage: 54, amount: 64_800, metricLabel: 'Underlying assets', tone: 'critical' },
        ]}
        tone={aggregateReliabilityTone(['healthy', 'critical'])}
        tooltip="Aggregate quality"
        onClick={() => undefined}
      />,
    )

    expect(html).toContain('100.0%')
    expect(html).toContain('No anomaly')
    expect(html).toContain('Portfolio data')
    expect(html).toContain('Diversification')
    expect(html).toContain('54.0%')
    expect(html).toContain('Underlying assets')
    expect(html).toContain('Review')
    expect(html).toContain('·')
    expect(html).not.toMatch(/>base</)
    expect(html).toMatch(/text-emerald-400[^>]*>No anomaly/)
    expect(html).toContain('text-emerald-400')
    expect(html).toContain('text-red-400')
  })

  it('assigns colors independently from the reliability percentage', () => {
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

  it('derives the Portfolio data status from scoped anomalies', () => {
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 0 })).toBe('healthy')
    expect(pipelineReliabilityTone({ errorCount: 0, warningCount: 2 })).toBe('warning')
    expect(pipelineReliabilityTone({ errorCount: 1, warningCount: 0 })).toBe('critical')
    expect(pipelineStatusLabel({ errorCount: 0, warningCount: 0 })).toBe('No anomaly')
    expect(pipelineStatusLabel({ errorCount: 0, warningCount: 2 })).toBe('2 anomalies')
  })
})

describe('PipelineReliabilityKpi', () => {
  it('renders the neutral no-anomaly value in gray', () => {
    const html = renderToStaticMarkup(
      <PipelineReliabilityKpi
        errorCount={0}
        warningCount={0}
        onClick={() => undefined}
      />,
    )

    expect(html).toContain('No anomaly')
    expect(html).toContain('Portfolio data')
    expect(html).toMatch(/text-\[10px\][^>]*font-normal[^>]*text-gray-600[^>]*>No anomaly/)
  })
})
