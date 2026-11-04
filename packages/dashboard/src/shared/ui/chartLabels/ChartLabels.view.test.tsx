// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { BarChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SeriesBar } from '@/shared/ui/SeriesBar.view'

import { ChartLabels } from './ChartLabels.view'

afterEach(cleanup)

function Example({ value }: { value: number | null }) {
  const formatPercentage = useFormatPercentage()
  return (
    <BarChart
      width={400}
      height={300}
      data={[{ amount: 10, percentage: value }]}
    >
      <SeriesBar dataKey="amount" tone="series1" motion="none">
        <ChartLabels
          position="inside"
          label={(point: { percentage: number | null }) =>
            formatPercentage(point.percentage)
          }
        />
      </SeriesBar>
    </BarChart>
  )
}

describe('ChartLabels', () => {
  it.each<[number | null, string]>([
    [12.5, '12.5%'],
    [0, '0.0%'],
    [-3, '-3.0%'],
    [null, '—'],
  ])('formats the typed data field %s as %s', async (value, expected) => {
    render(<Example value={value} />)
    expect(
      await within(screen.getByRole('application')).findByText(expected),
    ).toBeTruthy()
  })

  it('renders a text field selected from typed chart data', async () => {
    render(
      <BarChart width={400} height={300} data={[{ amount: 10, name: 'Alpha' }]}>
        <SeriesBar dataKey="amount" tone="series1" motion="none">
          <ChartLabels
            label={(point: { name: string }) => point.name}
            position="inside"
          />
        </SeriesBar>
      </BarChart>,
    )
    expect(
      await within(screen.getByRole('application')).findByText('Alpha'),
    ).toBeTruthy()
  })
})
