// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BarChart, type BarShapeProps } from 'recharts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'

import { ChartRectangle } from './ChartRectangle.view'
import { SeriesBar } from './SeriesBar.view'

afterEach(cleanup)

function SignedRectangle(
  props: Partial<Omit<BarShapeProps, 'className' | 'style'>>,
) {
  return (
    <g role="img" aria-label={`Bar ${props.index}`}>
      <ChartRectangle
        geometry={props}
        tone={props.index === 0 ? 'positive' : 'series5'}
      />
    </g>
  )
}

describe('SeriesBar', () => {
  it('injects each bar index into the renderer and preserves bar actions', async () => {
    const onClick = vi.fn()
    render(
      <BarChart
        width={500}
        height={300}
        data={[
          { name: 'Alpha', value: 10 },
          { name: 'Beta', value: 20 },
        ]}
      >
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <SeriesBar
          dataKey="value"
          tone={'series1'}
          corners="top"
          motion="none"
          onClick={onClick}
        >
          <SeriesBar.Shape>
            <SignedRectangle />
          </SeriesBar.Shape>
        </SeriesBar>
      </BarChart>,
    )
    const first = await screen.findByRole('img', { name: 'Bar 0' })
    expect(screen.getByRole('img', { name: 'Bar 1' })).toBeTruthy()
    await userEvent.setup().click(first)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
