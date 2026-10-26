// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { Bar, BarChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { ChartGrid, ChartXAxis, ChartYAxis } from './ChartAxes.view'
import { ChartReference } from './ChartReference.view'

afterEach(cleanup)

describe('chart axes', () => {
  it('registers wrapped axes in a real chart and applies the shared tick and grid appearance', async () => {
    const { container } = render(
      <BarChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', value: 10 },
          { name: 'Beta', value: 20 },
        ]}
      >
        <ChartGrid />
        <ChartXAxis
          dataKey="name"
          tickFormatter={(value) => `Group ${value}`}
        />
        <ChartYAxis />
        <ChartReference y={10} />
        <Bar dataKey="value" isAnimationActive={false} />
      </BarChart>,
    )
    await waitFor(() => expect(screen.getByText('Group Alpha')).toBeTruthy())
    expect(screen.getByText('Group Beta')).toBeTruthy()
    const tick = screen.getByText('Group Alpha').closest('text')
    expect(tick?.getAttribute('fill')).toBe('var(--chart-tick)')
    expect(tick?.getAttribute('font-size')).toBe('11')
    expect(
      container
        .querySelector('.recharts-cartesian-grid line')
        ?.getAttribute('stroke'),
    ).toBe('var(--chart-grid)')
    expect(
      container.querySelector('.recharts-xAxis .recharts-cartesian-axis-line'),
    ).toBeNull()
    expect(container.querySelector('.recharts-yAxis')).not.toBeNull()
    expect(
      container
        .querySelector('.recharts-reference-line-line')
        ?.getAttribute('stroke'),
    ).toBe('var(--chart-zero)')
  })
})
