import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComposedChart } from 'recharts'

import { ChartGrid } from '@/shared/ui/chartAxes/ChartGrid.view'
import { ChartXAxis } from '@/shared/ui/chartAxes/ChartXAxis.view'
import { ChartYAxis } from '@/shared/ui/chartAxes/ChartYAxis.view'

import { SeriesLine } from '../../SeriesLine.view'
import { HISTORY } from '../fixtures'

const meta = {
  title: 'Charts/Axes and grid',
  component: ChartXAxis,
} satisfies Meta<typeof ChartXAxis>
export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  args: { dataKey: 'month', density: 'standard', axis: true },
  render: function Render(args) {
    return (
      <ComposedChart width={560} height={300} data={HISTORY}>
        <ChartGrid />
        <ChartXAxis {...args} />
        <ChartYAxis density={args.density} axis={args.axis} />
        <SeriesLine dataKey="value" tone={'series6'} motion="none" />
      </ComposedChart>
    )
  },
}
export const Compact: Story = {
  ...Standard,
  args: { ...Standard.args, density: 'compact', axis: false },
}
export const SolidGrid: Story = {
  render: function Render() {
    return (
      <ComposedChart width={560} height={300} data={HISTORY}>
        <ChartGrid pattern="solid" />
        <ChartXAxis dataKey="month" />
        <ChartYAxis />
        <SeriesLine dataKey="value" tone={'series6'} motion="none" />
      </ComposedChart>
    )
  },
}
