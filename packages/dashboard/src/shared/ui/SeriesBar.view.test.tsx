// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BarChart, type BarShapeProps } from 'recharts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChartXAxis, ChartYAxis } from './ChartAxes.view'
import { ChartRectangle } from './ChartRectangle.view'
import { SeriesBar } from './SeriesBar.view'

afterEach(cleanup)

function SignedRectangle(props: Partial<BarShapeProps>) {
  return (
    <ChartRectangle
      geometry={props}
      tone={props.index === 0 ? 'performancePositive' : 'performanceNegative'}
    />
  )
}

describe('SeriesBar', () => {
  it('injects shape data and geometry, shares appearance and preserves bar actions', async () => {
    const onClick = vi.fn()
    const { container } = render(
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
          tone="netContributions"
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
    await waitFor(() =>
      expect(
        container.querySelectorAll(
          '.recharts-bar-rectangle .recharts-rectangle',
        ),
      ).toHaveLength(2),
    )
    const rectangles = container.querySelectorAll(
      '.recharts-bar-rectangle .recharts-rectangle',
    )
    expect(rectangles[0].getAttribute('fill')).toBe('#22c55e')
    expect(rectangles[1].getAttribute('fill')).toBe('#ef4444')
    expect(rectangles[0].getAttribute('d')).toContain('A')
    await userEvent.setup().click(rectangles[0])
    expect(onClick).toHaveBeenCalledOnce()
  })
})
