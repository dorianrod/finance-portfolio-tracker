import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'

import { ChartTooltip } from '../../ChartTooltip.view'
import { SeriesArea } from '../../SeriesArea.view'
import { SeriesGradient } from '../../SeriesGradient.view'
import { CartesianExample, TransactionDotExample } from '../ChartExamples.view'

const meta = {
  title: 'Charts/Series/Area',
  component: SeriesArea,
} satisfies Meta<typeof SeriesArea>
export default meta
type Story = StoryObj<typeof meta>

function Render(args: React.ComponentProps<typeof SeriesArea>) {
  const id = useId()
  return (
    <CartesianExample>
      <defs>
        <SeriesGradient id={id} tone="portfolioValue" profile="soft" />
      </defs>
      <ChartTooltip highlight="line" />
      <SeriesArea {...args} gradientId={id} />
    </CartesianExample>
  )
}
export const Playground: Story = {
  args: {
    dataKey: 'value',
    tone: 'portfolioValue',
    weight: 'regular',
    markers: 'normal',
  },
  render: Render,
}
export const Projection: Story = {
  ...Playground,
  args: { ...Playground.args, pattern: 'projection' },
}
export const TransactionMarkers: Story = {
  ...Playground,
  render: function Render(args) {
    const id = useId()
    return (
      <CartesianExample>
        <defs>
          <SeriesGradient id={id} tone="portfolioValue" />
        </defs>
        <SeriesArea {...args} gradientId={id}>
          <SeriesArea.Markers>
            <TransactionDotExample />
          </SeriesArea.Markers>
        </SeriesArea>
      </CartesianExample>
    )
  },
}
