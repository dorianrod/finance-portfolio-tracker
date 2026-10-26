import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChartReference, ChartReferenceArea } from '../../ChartReference.view'
import { SeriesLine } from '../../SeriesLine.view'
import { CartesianExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/References',
  component: ChartReference,
} satisfies Meta<typeof ChartReference>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { y: 50, kind: 'benchmark' },
  render: function Render(args) {
    return (
      <CartesianExample>
        <ChartReferenceArea x1="Jan" x2="Mar" period="previous" />
        <ChartReferenceArea x1="Mar" x2="May" period="current" />
        <SeriesLine dataKey="value" tone="portfolioValue" motion="none" />
        <ChartReference {...args} />
      </CartesianExample>
    )
  },
}
export const Zero: Story = { ...Playground, args: { y: 0, kind: 'zero' } }
export const Selected: Story = {
  ...Playground,
  args: { y: 57, kind: 'selected' },
}
export const Crosshair: Story = {
  ...Playground,
  args: { x: 'Mar', kind: 'crosshair' },
}
