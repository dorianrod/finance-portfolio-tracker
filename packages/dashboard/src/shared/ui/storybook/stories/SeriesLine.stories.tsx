import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesLine } from '../../SeriesLine.view'
import { CartesianExample, TransactionDotExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Series/Line',
  component: SeriesLine,
  args: { tone: 'portfolioValue' },
} satisfies Meta<typeof SeriesLine>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    dataKey: 'value',
    tone: 'portfolioValue',
    motion: 'none',
    weight: 'regular',
    markers: 'normal',
    hover: 'series',
  },
  render: function Render(args) {
    return (
      <CartesianExample>
        <ChartTooltip highlight="line" />
        <SeriesLine {...args} />
      </CartesianExample>
    )
  },
}
export const Projection: Story = {
  ...Playground,
  args: { ...Playground.args, pattern: 'projection', weight: 'emphasized' },
}
export const TransactionMarkers: Story = {
  ...Playground,
  render: function Render(args) {
    return (
      <CartesianExample>
        <SeriesLine {...args}>
          <SeriesLine.Markers>
            <TransactionDotExample />
          </SeriesLine.Markers>
        </SeriesLine>
      </CartesianExample>
    )
  },
}
