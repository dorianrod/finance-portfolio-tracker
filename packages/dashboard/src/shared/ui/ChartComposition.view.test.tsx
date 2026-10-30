// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  BarChart,
  PieChart,
  type PieSectorShapeProps,
  ScatterChart,
  type ScatterShapeProps,
} from 'recharts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
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

function ValueLabels() {
  const formatNumber = useFormatNumber()
  return (
    <ChartLabels
      label={(point: { value: number }) => formatNumber(point.value)}
      position="inside"
    />
  )
}
function PieShape(
  props: Partial<Omit<PieSectorShapeProps, 'className' | 'style'>>,
) {
  return (
    <g role="img" aria-label={String(props.name)}>
      <ChartSector
        geometry={props}
        tone={getHashedSeriesTone('Equity')}
        selected
      />
    </g>
  )
}
function ScatterShape(
  props: Partial<Omit<ScatterShapeProps, 'className' | 'style'>>,
) {
  if (props.cx == null || props.cy == null) return null
  return (
    <g role="img" aria-label="Exposure">
      <ChartSymbol
        geometry={props}
        tone={'series10'}
        age={{ year: 2024, recent: false, oldestYear: 2020, newestYear: 2025 }}
      />
    </g>
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
  return (
    <div role="status" aria-label="Chart value">
      {String(payload?.[0]?.value)}
    </div>
  )
}

describe('shared chart composition', () => {
  it('renders labels and injects tooltip values through nested content', async () => {
    render(
      <BarChart width={500} height={300} data={[{ name: 'Alpha', value: 13 }]}>
        <ChartXAxis dataKey="name" />
        <ChartYAxis />
        <ChartTooltip active defaultIndex={0} highlight="bar">
          <TooltipContent />
        </ChartTooltip>
        <SeriesBar dataKey="value" tone={'series6'} motion="none">
          <ValueLabels />
        </SeriesBar>
      </BarChart>,
    )
    expect(
      await within(screen.getByRole('application')).findByText('13'),
    ).toBeTruthy()
    await waitFor(() =>
      expect(
        screen.getByRole('status', { name: 'Chart value' }).textContent,
      ).toBe('13'),
    )
  })
  it('injects pie geometry and preserves selection and click behavior', async () => {
    const onClick = vi.fn()
    render(
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
    const sector = await screen.findByRole('img', { name: 'Equity' })
    await userEvent.setup().click(sector)
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByText('Allocation')).toBeTruthy()
  })
  it('injects scatter coordinates into a composed renderer', async () => {
    render(
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
    expect(await screen.findByRole('img', { name: 'Exposure' })).toBeTruthy()
  })
})
