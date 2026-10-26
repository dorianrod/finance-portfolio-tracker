// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { LineChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { ChartXAxis, ChartYAxis } from './ChartAxes.view'
import { SeriesLine } from './SeriesLine.view'

afterEach(cleanup)

function CustomMarker({ cx, cy }: { cx?: number; cy?: number }) {
  return <circle data-marker="custom" cx={cx} cy={cy} r={3} />
}

describe('SeriesLine', () => {
  it('renders semantic series styling and injects coordinates into composed markers', async () => {
    const { container } = render(
      <LineChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', value: 10 },
          { name: 'Beta', value: 20 },
        ]}
      >
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <SeriesLine
          dataKey="value"
          tone={'series10'}
          weight="emphasized"
          motion="none"
        >
          <SeriesLine.Markers>
            <CustomMarker />
          </SeriesLine.Markers>
        </SeriesLine>
      </LineChart>,
    )
    await waitFor(() =>
      expect(container.querySelector('.recharts-line-curve')).not.toBeNull(),
    )
    const curve = container.querySelector('.recharts-line-curve')
    expect(curve?.getAttribute('stroke')).toBe('#14b8a6')
    expect(curve?.getAttribute('stroke-width')).toBe('2.5')
    const markers = container.querySelectorAll('[data-marker="custom"]')
    expect(markers).toHaveLength(2)
    expect(markers[0].getAttribute('cx')).not.toBeNull()
    expect(markers[0].getAttribute('cy')).not.toBeNull()
  })
})
