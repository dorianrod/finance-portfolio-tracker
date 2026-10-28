// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CombinedAnalysisReliabilityKpi.feature'
import { PipelineReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/PipelineReliabilityKpi.feature'

function renderWithProviders(node: ReactNode) {
  return render(
    <Provider store={createStore()}>
      <QueryClientProvider client={new QueryClient()}>
        {node}
      </QueryClientProvider>
    </Provider>,
  )
}

afterEach(cleanup)

describe('CombinedAnalysisReliabilityKpi', () => {
  it('shows a compact aggregate status and reveals its detail through the named tooltip trigger', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CombinedAnalysisReliabilityKpi
        statusMetric={{
          value: 'No anomaly',
          metricLabel: 'Portfolio data',
          tone: 'healthy',
        }}
        metrics={[
          {
            percentage: 100,
            amount: 120_000,
            metricLabel: 'Diversification',
            tone: 'healthy',
          },
          {
            percentage: 54,
            amount: 64_800,
            metricLabel: 'Underlying assets',
            tone: 'critical',
          },
        ]}
        tone="critical"
        tooltip="Aggregate quality"
        qualityTheme="classification"
        scope={{ account: 'filterable', period: 'mixed' }}
      />,
    )
    expect(
      screen.getByRole('button', {
        name: 'Data quality: Review. No anomaly Portfolio data; 100.0% Diversification; 54.0% Underlying assets. Open Data quality.',
      }),
    ).toBeTruthy()
    expect(screen.getByText('Review')).toBeTruthy()
    expect(screen.queryByRole('tooltip')).toBeNull()
    const trigger = screen.getByRole('button', {
      name: 'Show data quality details',
    })
    await user.click(trigger)
    const tooltip = screen.getByRole('tooltip')
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id)
    expect(within(tooltip).getByText('Aggregate quality')).toBeTruthy()
    expect(tooltip.textContent).toContain('No anomaly')
    expect(tooltip.textContent).toContain('Portfolio data')
    expect(tooltip.textContent).toContain('100.0%')
    expect(tooltip.textContent).toContain('Diversification')
    expect(tooltip.textContent).toContain('54.0%')
    expect(tooltip.textContent).toContain('Underlying assets')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('PipelineReliabilityKpi', () => {
  it('reveals the explanation and anomaly detail when its information trigger is focused', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PipelineReliabilityKpi
        errorCount={0}
        warningCount={0}
        scope={{ account: 'filterable', period: 'range' }}
      />,
    )
    expect(
      screen.getByRole('button', {
        name: 'Data quality: Reliable. 0 errors and 0 warnings in Portfolio data. Open Data quality.',
      }),
    ).toBeTruthy()
    await user.tab()
    await user.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.textContent).toContain(
      'Import, position and market-data anomalies',
    )
    expect(tooltip.textContent).toContain('Portfolio data')
    expect(tooltip.textContent).toContain('No anomaly')
    expect(tooltip.textContent).toContain('0 errors · 0 warnings')
  })
})
