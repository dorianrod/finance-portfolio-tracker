// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { LineChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'

import { SeriesLine } from './SeriesLine.view'

afterEach(cleanup)

function CustomMarker({ cx, cy }: { cx?: number; cy?: number }) {
  return <circle role="img" aria-label="Series point" cx={cx} cy={cy} r={3} />
}

describe('SeriesLine', () => {
  it('injects coordinates into composed markers for every data point', async () => {
    render(
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
      expect(screen.getAllByRole('img', { name: 'Series point' })).toHaveLength(
        2,
      ),
    )
    const markers = screen.getAllByRole('img', { name: 'Series point' })
    expect(markers[0].getAttribute('cx')).not.toBeNull()
    expect(markers[0].getAttribute('cy')).not.toBeNull()
  })
})
