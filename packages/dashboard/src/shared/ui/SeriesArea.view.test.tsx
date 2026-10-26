// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AreaChart } from 'recharts'
import { afterEach, describe, expect, it } from 'vitest'

import { ChartXAxis, ChartYAxis } from './ChartAxes.view'
import { SeriesArea } from './SeriesArea.view'
import { SeriesGradient } from './SeriesGradient.view'

afterEach(cleanup)

describe('SeriesArea', () => {
  it('renders a series against its shared gradient definition', async () => {
    const { container } = render(
      <AreaChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', value: 10 },
          { name: 'Beta', value: 20 },
        ]}
      >
        <defs>
          <SeriesGradient id="cost-gradient" tone="costBasis" profile="base" />
        </defs>
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <SeriesArea
          dataKey="value"
          tone="costBasis"
          gradientId="cost-gradient"
          weight="fine"
        />
      </AreaChart>,
    )
    await waitFor(() =>
      expect(container.querySelector('.recharts-area-area')).not.toBeNull(),
    )
    expect(
      container.querySelector('.recharts-area-area')?.getAttribute('fill'),
    ).toBe('url(#cost-gradient)')
    expect(
      container.querySelector('.recharts-area-curve')?.getAttribute('stroke'),
    ).toBe('#818cf8')
    const stops = container.querySelectorAll('[id="cost-gradient"] stop')
    expect(stops[0].getAttribute('stop-opacity')).toBe('0.6')
    expect(stops[1].getAttribute('stop-opacity')).toBe('0.2')
  })

  it('resolves category and grouped palettes through shared theme data', () => {
    const category = renderToStaticMarkup(
      <svg>
        <defs>
          <SeriesGradient id="category" category="france" profile="dense" />
        </defs>
      </svg>,
    )
    const grouped = renderToStaticMarkup(
      <svg>
        <defs>
          <SeriesGradient
            id="group"
            group={{
              key: 'Brokerage',
              index: 0,
              categories: { Brokerage: 'brokerage' },
            }}
          />
        </defs>
      </svg>,
    )
    expect(category).toContain('stop-color="#3b82f6"')
    expect(category).toContain('stop-opacity="0.8"')
    expect(grouped).toContain('stop-color="#3b82f6"')
  })
})
