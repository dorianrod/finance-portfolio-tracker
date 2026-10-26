import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartRectangle } from '../../ChartRectangle.view'
import { SeriesBar } from '../../SeriesBar.view'
import { BarShapeExample, CartesianExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Shapes/Rectangle',
  component: ChartRectangle,
} satisfies Meta<typeof ChartRectangle>
export default meta
type Story = StoryObj<typeof meta>

export const InSeries: Story = {
  args: { geometry: {}, tone: 'portfolioValue', prominence: 'full' },
  render: function Render(args) {
    return (
      <CartesianExample>
        <SeriesBar
          dataKey="value"
          tone={args.tone}
          prominence={args.prominence}
          corners="top"
          motion="none"
        >
          <SeriesBar.Shape>
            <BarShapeExample />
          </SeriesBar.Shape>
        </SeriesBar>
      </CartesianExample>
    )
  },
}
export const Muted: Story = {
  ...InSeries,
  args: { ...InSeries.args, prominence: 'muted' },
}
