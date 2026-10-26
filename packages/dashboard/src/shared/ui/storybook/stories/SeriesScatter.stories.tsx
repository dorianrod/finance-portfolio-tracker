import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScatterChart } from 'recharts'

import { ChartXAxis, ChartYAxis } from '../../ChartAxes.view'
import { ChartTooltip } from '../../ChartTooltip.view'
import { ChartSymbol, SeriesScatter } from '../../SeriesScatter.view'
import { ScatterShapeExample } from '../ChartExamples.view'
import { SCATTER } from '../fixtures'

const meta = {
  title: 'Charts/Series/Scatter',
  component: SeriesScatter,
  args: { tone: 'returnRate' },
} satisfies Meta<typeof SeriesScatter>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { tone: 'returnRate', name: 'Example observations', data: SCATTER },
  render: function Render(args) {
    return (
      <ScatterChart width={500} height={300}>
        <ChartXAxis dataKey="x" type="number" />
        <ChartYAxis dataKey="y" type="number" />
        <ChartTooltip />
        <SeriesScatter {...args} />
      </ScatterChart>
    )
  },
}
export const AgeWeightedSymbols: Story = {
  ...Playground,
  render: function Render(args) {
    return (
      <ScatterChart width={500} height={300}>
        <ChartXAxis dataKey="x" type="number" />
        <ChartYAxis dataKey="y" type="number" />
        <SeriesScatter {...args}>
          <SeriesScatter.Shape>
            <ScatterShapeExample />
          </SeriesScatter.Shape>
        </SeriesScatter>
      </ScatterChart>
    )
  },
}

export const Symbol: StoryObj<typeof ChartSymbol> = {
  args: {
    geometry: { cx: 40, cy: 40, size: 200 },
    tone: 'returnRate',
    age: { year: 2025, recent: true, oldestYear: 2020, newestYear: 2025 },
  },
  render: function Render(args) {
    return (
      <svg width="100" height="80">
        <ChartSymbol {...args} />
      </svg>
    )
  },
}
