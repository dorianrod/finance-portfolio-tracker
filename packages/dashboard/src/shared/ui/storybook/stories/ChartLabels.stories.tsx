import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartLabels, ChartLegend } from '../../ChartLabels.view'
import { SeriesBar } from '../../SeriesBar.view'
import { CartesianExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Labels and legend',
  component: ChartLabels,
} satisfies Meta<typeof ChartLabels>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { dataKey: 'value', position: 'top', density: 'compact' },
  render: function Render(args) {
    return (
      <CartesianExample>
        <ChartLegend />
        <SeriesBar
          dataKey="value"
          name="Example balance"
          tone={'series6'}
          motion="none"
        >
          <ChartLabels {...args} />
        </SeriesBar>
      </CartesianExample>
    )
  },
}
export const Standard: Story = {
  ...Playground,
  args: { ...Playground.args, density: 'standard' },
}
