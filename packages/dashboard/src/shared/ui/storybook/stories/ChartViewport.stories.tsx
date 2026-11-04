import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComposedChart } from 'recharts'

import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'

import { ChartViewport } from '../../ChartViewport.view'
import { SeriesLine } from '../../SeriesLine.view'
import { HISTORY } from '../fixtures'

const meta = {
  title: 'Charts/Viewport',
  component: ChartViewport,
  args: { height: 300, label: 'Monthly history', children: null },
} satisfies Meta<typeof ChartViewport>
export default meta
type Story = StoryObj<typeof meta>

export const Visible: Story = {
  render: function Render(args) {
    return (
      <ChartViewport {...args}>
        <ComposedChart data={HISTORY}>
          <ChartGrid />
          <ChartXAxis dataKey="month" />
          <ChartYAxis />
          <SeriesLine dataKey="value" tone="series6" motion="none" />
        </ComposedChart>
      </ChartViewport>
    )
  },
}

export const BelowFold: Story = {
  ...Visible,
  decorators: [
    function ScrollExample(Story) {
      return (
        <div>
          <div className="h-screen">
            Scroll down or Tab to reveal the chart.
          </div>
          <Story />
        </div>
      )
    },
  ],
}
