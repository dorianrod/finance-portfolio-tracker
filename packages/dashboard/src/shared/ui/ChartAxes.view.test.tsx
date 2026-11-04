// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { Bar, BarChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartReference } from '@/shared/ui/chartReference/ChartReference.view'

afterEach(cleanup)

describe('chart axes', () => {
  it('registers wrapped axes in a real chart and applies their tick formatters', async () => {
    render(
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
        <ChartYAxis tickFormatter={(value) => `Amount ${value}`} />
        <ChartReference y={10} />
        <Bar dataKey="value" isAnimationActive={false} />
      </BarChart>,
    )
    await waitFor(() => expect(screen.getByText('Group Alpha')).toBeTruthy())
    expect(screen.getByText('Group Beta')).toBeTruthy()
    expect(
      within(screen.getByRole('application')).getByText('Amount 0'),
    ).toBeTruthy()
  })
})
