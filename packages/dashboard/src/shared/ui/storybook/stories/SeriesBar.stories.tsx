import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartLabels } from '@/shared/ui/chartLabels/ChartLabels.view'

import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesBar } from '../../SeriesBar.view'
import { BarShapeExample, CartesianExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Series/Bar',
  component: SeriesBar,
} satisfies Meta<typeof SeriesBar>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    dataKey: 'value',
    tone: 'series6',
    motion: 'none',
    corners: 'top',
    prominence: 'full',
  },
  render: function Render(args) {
    return (
      <CartesianExample>
        <ChartTooltip highlight="bar" />
        <SeriesBar {...args}>
          <ChartLabels dataKey="value" position="top" />
        </SeriesBar>
      </CartesianExample>
    )
  },
}
export const CustomShape: Story = {
  ...Playground,
  render: function Render(args) {
    return (
      <CartesianExample>
        <SeriesBar {...args}>
          <SeriesBar.Shape>
            <BarShapeExample />
          </SeriesBar.Shape>
        </SeriesBar>
      </CartesianExample>
    )
  },
}
export const Muted: Story = {
  ...Playground,
  args: { ...Playground.args, prominence: 'muted', corners: 'rounded' },
}
export const Stacked: Story = {
  render: function Stacked() {
    return (
      <CartesianExample>
        <SeriesBar
          dataKey="value"
          tone={'series6'}
          stackId="total"
          motion="none"
        />
        <SeriesBar
          dataKey="contributions"
          tone={'series1'}
          stackId="total"
          motion="none"
        />
      </CartesianExample>
    )
  },
}
