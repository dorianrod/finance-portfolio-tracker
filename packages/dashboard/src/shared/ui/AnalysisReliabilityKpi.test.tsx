import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
} from './AnalysisReliabilityKpi'
import {
  aggregateReliabilityTone,
  percentageReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
} from '../quality/analysisReliability'

describe('CombinedAnalysisReliabilityKpi', () => {
  it('shows a compact aggregate status and puts the detail in the info tooltip', () => {
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
        scope={{ account: 'filterable', period: 'mixed' }}
      />,
    )

    expect(html).toContain('Data quality')
    expect(html).toContain('Review')
    expect(html).toContain('data-quality-kpi')
    expect(html).toContain('aria-label="Data quality: Review. No anomaly Portfolio data; 100.0% Diversification; 54.0% Underlying assets. Open Data quality."')
    expect(html).toContain('aria-label="Show data quality details"')
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('Aggregate quality')
    expect(html).toContain('No anomaly')
    expect(html).toContain('Portfolio data')
    expect(html).toContain('100.0%')
    expect(html).toContain('Diversification')
    expect(html).toContain('54.0%')
    expect(html).toContain('Underlying assets')
    expect(html).toContain('>i</span>')
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
  it('renders its explanation and anomaly detail in the info tooltip', () => {
    const html = renderToStaticMarkup(
      <PipelineReliabilityKpi
        errorCount={0}
        warningCount={0}
        onClick={() => undefined}
        scope={{ account: 'filterable', period: 'range' }}
      />,
    )

    expect(html).toContain('Data quality')
    expect(html).toContain('Reliable')
    expect(html).toContain('aria-label="Data quality: Reliable. 0 errors and 0 warnings in Portfolio data. Open Data quality."')
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('Import, position and market-data anomalies')
    expect(html).toContain('Portfolio data')
    expect(html).toContain('No anomaly')
    expect(html).toContain('0 errors · 0 warnings')
    expect(html).toContain('>i</span>')
  })
})
