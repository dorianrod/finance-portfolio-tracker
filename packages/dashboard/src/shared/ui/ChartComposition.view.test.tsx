// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  BarChart,
  PieChart,
  type PieSectorShapeProps,
  ScatterChart,
  type ScatterShapeProps,
} from 'recharts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getHashedSeriesTone } from '@/shared/theme/chartColors/getHashedSeriesTone'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'
import { ChartLabels } from '@/shared/ui/chartLabels/ChartLabels.view'
import { ChartSymbol } from '@/shared/ui/seriesScatter/ChartSymbol.view'
import { SeriesScatter } from '@/shared/ui/seriesScatter/SeriesScatter.view'

import { ChartSector } from './ChartSector.view'
import { ChartTooltip } from './ChartTooltip.view'
import { SeriesBar } from './SeriesBar.view'
import { SeriesPie } from './SeriesPie.view'

afterEach(cleanup)
function PieShape(props: Partial<Omit<PieSectorShapeProps, 'className'>>) {
  return (
    <ChartSector
      geometry={props}
      tone={getHashedSeriesTone('Equity')}
      selected
    />
  )
}
function ScatterShape(props: Partial<Omit<ScatterShapeProps, 'className'>>) {
  return (
    <ChartSymbol
      geometry={props}
      tone={'series10'}
      age={{ year: 2024, recent: false, oldestYear: 2020, newestYear: 2025 }}
    />
  )
}
function PieLabels({ cx, cy }: { cx?: number; cy?: number }) {
  return (
    <ChartLabel x={cx} y={cy}>
      Allocation
    </ChartLabel>
  )
}
function TooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value?: unknown }>
}) {
  if (!active) return null
  return <div data-testid="chart-tooltip">{String(payload?.[0]?.value)}</div>
}

describe('shared chart composition', () => {
  it('renders labels and injects tooltip values through nested content', async () => {
    const { container, getByTestId } = render(
      <BarChart width={500} height={300} data={[{ name: 'Alpha', value: 10 }]}>
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <ChartTooltip active defaultIndex={0} highlight="bar">
          <TooltipContent />
        </ChartTooltip>
        <SeriesBar dataKey="value" tone={'series6'} motion="none">
          <ChartLabels dataKey="value" position="inside" />
        </SeriesBar>
      </BarChart>,
    )
    await waitFor(() =>
      expect(container.querySelector('.recharts-label')?.textContent).toBe(
        '10',
      ),
    )
    expect(
      container.querySelector('.recharts-label')?.getAttribute('style'),
    ).toContain('font-size: 10px')
    await waitFor(() =>
      expect(getByTestId('chart-tooltip').textContent).toBe('10'),
    )
  })
  it('injects pie geometry and preserves selection and click behavior', async () => {
    const onClick = vi.fn()
    const { container } = render(
      <PieChart width={400} height={300}>
        <SeriesPie
          data={[{ name: 'Equity', value: 10 }]}
          dataKey="value"
          outerRadius={80}
          interactive
          motion="none"
          labelConnector
          onClick={onClick}
        >
          <SeriesPie.Shape>
            <PieShape />
          </SeriesPie.Shape>
          <SeriesPie.Labels>
            <PieLabels />
          </SeriesPie.Labels>
        </SeriesPie>
      </PieChart>,
    )
    await waitFor(() =>
      expect(container.querySelector('.recharts-sector')).not.toBeNull(),
    )
    const sector = container.querySelector('.recharts-sector')!
    expect(sector.getAttribute('d')).toBeTruthy()
    expect(sector.getAttribute('fill')).toBeTruthy()
    expect(sector.getAttribute('stroke-width')).toBe('2')
    await userEvent.setup().click(sector)
    expect(onClick).toHaveBeenCalledOnce()
    expect(container.textContent).toContain('Allocation')
  })
  it('injects scatter data into semantic symbols and keeps age prominence', async () => {
    const { container } = render(
      <ScatterChart width={400} height={300}>
        <ChartXAxis dataKey="x" type="number" />
        <ChartYAxis dataKey="y" type="number" />
        <SeriesScatter data={[{ x: 5, y: 10 }]} tone={'series10'}>
          <SeriesScatter.Shape>
            <ScatterShape />
          </SeriesScatter.Shape>
        </SeriesScatter>
      </ScatterChart>,
    )
    await waitFor(() =>
      expect(container.querySelector('.recharts-symbols')).not.toBeNull(),
    )
    const symbol = container.querySelector('.recharts-symbols')!
    expect(symbol.getAttribute('fill')).toBe('#14b8a6')
    expect(Number(symbol.getAttribute('fill-opacity'))).toBeCloseTo(0.58)
    expect(symbol.getAttribute('d')).toBeTruthy()
  })
})
