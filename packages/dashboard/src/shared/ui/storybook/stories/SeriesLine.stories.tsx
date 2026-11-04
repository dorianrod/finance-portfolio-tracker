import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesLine } from '../../SeriesLine.view'
import { CartesianExample, MarkerDotExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Series/Line',
  component: SeriesLine,
  args: { tone: 'series6' },
} satisfies Meta<typeof SeriesLine>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    dataKey: 'value',
    tone: 'series6',
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
export const ChartMarkers: Story = {
  ...Playground,
  render: function Render(args) {
    return (
      <CartesianExample>
        <SeriesLine {...args}>
          <SeriesLine.Markers>
            <MarkerDotExample />
          </SeriesLine.Markers>
        </SeriesLine>
      </CartesianExample>
    )
  },
}
